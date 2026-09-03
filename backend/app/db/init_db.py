import json

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.services.analytics_service import AnalyticsService
from app.services.spatial_service import SpatialService

# Curated real-world Indian conservation site coordinates (GeoJSON Polygons)
SEED_SITES_DATA = [
    {
        "project_name": "Sundarbans Mangrove Blue Carbon Initiative",
        "project_type": "Blue Carbon (Mangroves)",
        "target_carbon": 35000.0,
        "description": "High-impact tidal mangrove restoration sequestering carbon in biomass and deep saline sediment pools in the Ganges delta.",
        "site_name": "Gosaba Deltaic Mangrove Reserve",
        "habitat_type": "Mangrove / Blue Carbon",
        "established_year": 2021,
        "coordinates": [
            [
                [88.7521, 22.1843],
                [88.7915, 22.1843],
                [88.8021, 22.1482],
                [88.7612, 22.1391],
                [88.7390, 22.1610],
                [88.7521, 22.1843],
            ]
        ],
    },
    {
        "project_name": "Western Ghats Biodiversity & Agroforestry Corridor",
        "project_type": "Agroforestry",
        "target_carbon": 18000.0,
        "description": "Multi-strata shade-grown agroforestry corridor revitalizing endemic bird habitats and native canopy cover in Wayanad.",
        "site_name": "Wayanad Highland Canopy Zone",
        "habitat_type": "Agroforestry",
        "established_year": 2022,
        "coordinates": [
            [
                [76.0832, 11.6841],
                [76.1215, 11.6982],
                [76.1420, 11.6671],
                [76.1011, 11.6420],
                [76.0710, 11.6610],
                [76.0832, 11.6841],
            ]
        ],
    },
    {
        "project_name": "Aravalli Native Scrubland Eco-Restoration",
        "project_type": "Reforestation",
        "target_carbon": 12000.0,
        "description": "Combating desertification in the National Capital Region by restoring native Dhau (Anogeissus pendula) scrub forests.",
        "site_name": "Damdama Ridge Afforestation Plot",
        "habitat_type": "Semi-Arid Scrubland",
        "established_year": 2022,
        "coordinates": [
            [
                [77.0812, 28.3241],
                [77.1142, 28.3380],
                [77.1290, 28.3110],
                [77.0920, 28.2980],
                [77.0720, 28.3120],
                [77.0812, 28.3241],
            ]
        ],
    },
    {
        "project_name": "Corbett Landscape Buffer Zone Restoration",
        "project_type": "Reforestation",
        "target_carbon": 25000.0,
        "description": "Riparian buffer afforestation connecting elephant corridors and recovering native Sal forest biomass in Uttarakhand foothills.",
        "site_name": "Koshi Riverbank Wildlife Corridor",
        "habitat_type": "Tropical Moist Deciduous",
        "established_year": 2020,
        "coordinates": [
            [
                [79.0821, 29.4621],
                [79.1190, 29.4780],
                [79.1380, 29.4450],
                [79.0980, 29.4290],
                [79.0680, 29.4410],
                [79.0821, 29.4621],
            ]
        ],
    },
]


def init_db(db: Session) -> None:
    """Seeds initial administrator account and realistic carbon projects with 36-month analytics."""
    # 1. Admin user
    admin_email = "admin@darukaa.earth"
    admin = db.query(User).filter(User.email == admin_email).first()
    if not admin:
        admin = User(
            email=admin_email,
            hashed_password=get_password_hash("admin123456"),
            full_name="Ankita Dasgupta (Demo Admin)",
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    # 2. Seed projects & sites if database is empty
    if db.query(Project).count() == 0:
        for seed_data in SEED_SITES_DATA:
            project = Project(
                user_id=admin.id,
                name=seed_data["project_name"],
                description=seed_data["description"],
                project_type=seed_data["project_type"],
                target_carbon_tco2e=seed_data["target_carbon"],
                status="Active",
                country="India",
            )
            db.add(project)
            db.flush()

            raw_geom = {
                "type": "Polygon",
                "coordinates": seed_data["coordinates"],
            }
            cleaned_geom, c_lat, c_lng = SpatialService.validate_and_clean_geometry(raw_geom)
            area_ha = SpatialService.calculate_geodesic_area_hectares(db, cleaned_geom)
            if area_ha <= 0:
                area_ha = 120.5

            site = Site(
                project_id=project.id,
                name=seed_data["site_name"],
                description=seed_data["description"],
                habitat_type=seed_data["habitat_type"],
                geojson_str=json.dumps(cleaned_geom),
                area_hectares=area_ha,
                centroid_lat=c_lat,
                centroid_lng=c_lng,
                established_year=seed_data["established_year"],
            )
            db.add(site)
            db.flush()

            # Seed 36 months of empirical time series
            metrics = AnalyticsService.generate_synthetic_historical_metrics(
                site_id=site.id,
                area_hectares=area_ha,
                habitat_type=site.habitat_type,
                established_year=site.established_year,
                months_count=36,
            )
            db.add_all(metrics)

        db.commit()
