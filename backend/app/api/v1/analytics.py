from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.metric import SiteAnalyticsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics & MRV"])


@router.get("/portfolio/overview", response_model=Dict[str, Any])
def get_portfolio_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns top-level aggregate KPIs for the executive analytics dashboard."""
    projects = db.query(Project).all()
    sites = db.query(Site).all()

    total_hectares = sum(s.area_hectares for s in sites)
    total_carbon = 0.0
    latest_ndvis = []
    shannon_scores = []
    total_species = 0

    for s in sites:
        if s.metrics:
            latest = s.metrics[-1]
            total_carbon += latest.carbon_stock_tco2e
            latest_ndvis.append(latest.ndvi_index)
            shannon_scores.append(latest.biodiversity_shannon_index)
            total_species += latest.species_richness_count

    avg_ndvi = round(sum(latest_ndvis) / len(latest_ndvis), 3) if latest_ndvis else 0.0
    avg_shannon = round(sum(shannon_scores) / len(shannon_scores), 2) if shannon_scores else 0.0

    return {
        "total_projects": len(projects),
        "total_sites": len(sites),
        "total_monitored_hectares": round(total_hectares, 1),
        "total_carbon_stock_tco2e": round(total_carbon, 1),
        "average_ecosystem_health_ndvi": avg_ndvi,
        "average_biodiversity_index": avg_shannon,
        "monitored_species_richness": total_species,
    }


@router.get("/{site_id}", response_model=SiteAnalyticsResponse)
def get_site_analytics(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns granular time-series data and formatted Highcharts series for a site,
    including Carbon Sequestration, NDVI seasonal cycles, and Biodiversity indices.
    """
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    metrics = site.metrics or []
    project_name = site.project.name if site.project else "Independent Site"

    return AnalyticsService.format_analytics_response(
        site_id=site.id,
        site_name=site.name,
        project_name=project_name,
        habitat_type=site.habitat_type,
        area_hectares=site.area_hectares,
        established_year=site.established_year,
        metrics=metrics,
    )
