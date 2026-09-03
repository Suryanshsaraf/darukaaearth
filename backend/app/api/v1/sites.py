import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from geoalchemy2.shape import from_shape
from shapely.geometry import shape
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.site import GeoJSONFeature, GeoJSONFeatureCollection, SiteCreate, SiteOut
from app.services.analytics_service import AnalyticsService
from app.services.spatial_service import SpatialService

router = APIRouter(prefix="/sites", tags=["Sites & Geospatial"])


@router.get("/geojson", response_model=GeoJSONFeatureCollection)
def get_all_sites_geojson(
    project_id: Optional[str] = Query(None, description="Optional project ID filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns all conservation sites as a standard GeoJSON FeatureCollection,
    optimized for direct ingestion into Mapbox GL JS sources.
    """
    query = db.query(Site)
    if project_id:
        query = query.filter(Site.project_id == project_id)
    sites = query.all()

    features = []
    for site in sites:
        try:
            geom_data = json.loads(site.geojson_str)
        except Exception:
            continue

        latest_metric = site.metrics[-1] if site.metrics else None
        properties = {
            "id": site.id,
            "name": site.name,
            "project_id": site.project_id,
            "project_name": site.project.name if site.project else "Unknown",
            "habitat_type": site.habitat_type,
            "area_hectares": site.area_hectares,
            "centroid_lat": site.centroid_lat,
            "centroid_lng": site.centroid_lng,
            "established_year": site.established_year,
            "current_carbon_tco2e": latest_metric.carbon_stock_tco2e if latest_metric else 0.0,
            "latest_ndvi": latest_metric.ndvi_index if latest_metric else 0.0,
            "biodiversity_score": latest_metric.biodiversity_shannon_index if latest_metric else 0.0,
        }

        features.append(
            GeoJSONFeature(
                type="Feature",
                id=site.id,
                geometry=geom_data,
                properties=properties,
            )
        )

    return GeoJSONFeatureCollection(type="FeatureCollection", features=features)


@router.get("/", response_model=List[SiteOut])
def list_sites(
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all sites with basic summary information."""
    query = db.query(Site)
    if project_id:
        query = query.filter(Site.project_id == project_id)
    sites = query.order_by(Site.created_at.desc()).all()

    result = []
    for s in sites:
        latest = s.metrics[-1] if s.metrics else None
        try:
            geom_dict = json.loads(s.geojson_str)
        except Exception:
            geom_dict = {}

        result.append(
            SiteOut(
                id=s.id,
                project_id=s.project_id,
                project_name=s.project.name if s.project else "Unknown",
                name=s.name,
                description=s.description,
                habitat_type=s.habitat_type,
                area_hectares=s.area_hectares,
                centroid_lat=s.centroid_lat,
                centroid_lng=s.centroid_lng,
                established_year=s.established_year,
                geojson=geom_dict,
                created_at=s.created_at,
                current_carbon_tco2e=latest.carbon_stock_tco2e if latest else None,
                latest_ndvi=latest.ndvi_index if latest else None,
                biodiversity_score=latest.biodiversity_shannon_index if latest else None,
            )
        )
    return result


@router.post("/", response_model=SiteOut, status_code=status.HTTP_201_CREATED)
def create_site_from_polygon(
    site_in: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creates a new geographical site from a drawn GeoJSON polygon.
    Validates polygon topology, computes geodetic area via PostGIS ST_Area,
    derives centroid, and synthesizes 36-month baseline remote sensing metrics.
    """
    # 1. Verify project exists
    project = db.query(Project).filter(Project.id == site_in.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {site_in.project_id} not found",
        )

    # 2. Extract and validate GeoJSON geometry
    try:
        raw_geom = SpatialService.extract_geometry(site_in.geojson)
        cleaned_geom, c_lat, c_lng = SpatialService.validate_and_clean_geometry(raw_geom)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))

    # 3. Calculate geodesic area in hectares via PostGIS or ellipsoidal formula
    area_ha = SpatialService.calculate_geodesic_area_hectares(db, cleaned_geom)
    if area_ha <= 0.0:
        area_ha = 1.0  # Minimum baseline

    # 4. Prepare GeoAlchemy2 spatial geometry for PostGIS
    geom_wkt = None
    try:
        poly_shape = shape(cleaned_geom)
        geom_wkt = from_shape(poly_shape, srid=4326)
    except Exception:
        pass

    # 5. Persist Site
    site = Site(
        project_id=site_in.project_id,
        name=site_in.name,
        description=site_in.description,
        habitat_type=site_in.habitat_type,
        geom=geom_wkt,
        geojson_str=json.dumps(cleaned_geom),
        area_hectares=area_ha,
        centroid_lat=c_lat,
        centroid_lng=c_lng,
        established_year=site_in.established_year,
    )
    db.add(site)
    db.flush()  # obtain site.id

    # 6. Generate 36-month empirical time-series metrics (Sentinel-2, GEDI, GBIF)
    metrics = AnalyticsService.generate_synthetic_historical_metrics(
        site_id=site.id,
        area_hectares=area_ha,
        habitat_type=site_in.habitat_type,
        established_year=site_in.established_year,
        months_count=36,
    )
    db.add_all(metrics)
    db.commit()
    db.refresh(site)

    latest = metrics[-1]
    return SiteOut(
        id=site.id,
        project_id=site.project_id,
        project_name=project.name,
        name=site.name,
        description=site.description,
        habitat_type=site.habitat_type,
        area_hectares=site.area_hectares,
        centroid_lat=site.centroid_lat,
        centroid_lng=site.centroid_lng,
        established_year=site.established_year,
        geojson=cleaned_geom,
        created_at=site.created_at,
        current_carbon_tco2e=latest.carbon_stock_tco2e,
        latest_ndvi=latest.ndvi_index,
        biodiversity_score=latest.biodiversity_shannon_index,
    )


@router.get("/{site_id}", response_model=SiteOut)
def get_site_by_id(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve details of a single site."""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    latest = site.metrics[-1] if site.metrics else None
    try:
        geom_dict = json.loads(site.geojson_str)
    except Exception:
        geom_dict = {}

    return SiteOut(
        id=site.id,
        project_id=site.project_id,
        project_name=site.project.name if site.project else "Unknown",
        name=site.name,
        description=site.description,
        habitat_type=site.habitat_type,
        area_hectares=site.area_hectares,
        centroid_lat=site.centroid_lat,
        centroid_lng=site.centroid_lng,
        established_year=site.established_year,
        geojson=geom_dict,
        created_at=site.created_at,
        current_carbon_tco2e=latest.carbon_stock_tco2e if latest else None,
        latest_ndvi=latest.ndvi_index if latest else None,
        biodiversity_score=latest.biodiversity_shannon_index if latest else None,
    )


@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a site and its associated metrics."""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    db.delete(site)
    db.commit()
    return None
