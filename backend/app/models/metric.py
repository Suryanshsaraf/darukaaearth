import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base


class SiteMetric(Base):
    __tablename__ = "site_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    record_date = Column(Date, nullable=False, index=True)
    
    # Carbon MRV Metrics
    carbon_stock_tco2e = Column(Float, nullable=False, comment="Cumulative metric tons of CO2 equivalent stored")
    sequestration_rate_tco2e_yr = Column(Float, nullable=False, comment="Annualized sequestration velocity (tCO2e/yr)")
    
    # Remote Sensing Metrics (Sentinel-2 inspired)
    ndvi_index = Column(Float, nullable=False, comment="Normalized Difference Vegetation Index [0.0 - 1.0]")
    canopy_cover_pct = Column(Float, nullable=False, comment="Canopy density percentage [0 - 100%]")
    
    # Biodiversity & Soil Indicators (GBIF & SoilGrids inspired)
    biodiversity_shannon_index = Column(Float, nullable=False, comment="Shannon-Wiener Biodiversity Index [0.0 - 4.5]")
    species_richness_count = Column(Integer, nullable=False, comment="Monitored species count")
    soil_organic_carbon_g_kg = Column(Float, nullable=False, comment="Topsoil organic carbon density in g/kg")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    site = relationship("Site", back_populates="metrics")
