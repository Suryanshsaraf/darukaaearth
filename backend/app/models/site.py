import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.base import Base


class Site(Base):
    __tablename__ = "sites"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    habitat_type = Column(String(100), default="Tropical Moist Deciduous", nullable=False)
    
    # PostGIS spatial column for GIS calculations (EPSG:4326 WGS84)
    geom = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)
    geojson_str = Column(Text, nullable=False, comment="Cached GeoJSON Polygon representation")
    
    area_hectares = Column(Float, nullable=False, default=0.0)
    centroid_lat = Column(Float, nullable=False, default=0.0)
    centroid_lng = Column(Float, nullable=False, default=0.0)
    
    established_year = Column(Integer, default=2021, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    project = relationship("Project", back_populates="sites")
    metrics = relationship(
        "SiteMetric",
        back_populates="site",
        cascade="all, delete-orphan",
        order_by="SiteMetric.record_date",
    )
