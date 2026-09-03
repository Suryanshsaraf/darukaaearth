from datetime import date
from typing import Any, Dict, List
from pydantic import BaseModel


class MetricRecord(BaseModel):
    record_date: date
    carbon_stock_tco2e: float
    sequestration_rate_tco2e_yr: float
    ndvi_index: float
    canopy_cover_pct: float
    biodiversity_shannon_index: float
    species_richness_count: int
    soil_organic_carbon_g_kg: float

    class Config:
        from_attributes = True


class KPISummary(BaseModel):
    total_carbon_stock_tco2e: float
    annual_sequestration_rate_tco2e: float
    mean_ndvi: float
    canopy_cover_percentage: float
    shannon_diversity_index: float
    species_richness_count: int
    soil_organic_carbon_g_kg: float
    carbon_density_tco2e_ha: float


class SiteAnalyticsResponse(BaseModel):
    site_id: str
    site_name: str
    project_name: str
    habitat_type: str
    area_hectares: float
    established_year: int
    kpis: KPISummary
    history: List[MetricRecord]
    highcharts_series: Dict[str, Any]
    methodology: Dict[str, str]
