from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: str | None = None
    project_type: str = "Reforestation"
    target_carbon_tco2e: float = Field(default=10000.0, ge=0.0)
    status: str = "Active"
    country: str = "India"


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    project_type: str | None = None
    target_carbon_tco2e: float | None = None
    status: str | None = None
    country: str | None = None


class ProjectOut(ProjectBase):
    id: str
    user_id: str
    created_at: datetime
    site_count: int = 0
    total_area_hectares: float = 0.0
    current_carbon_stock_tco2e: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class SiteBrief(BaseModel):
    id: str
    name: str
    area_hectares: float
    centroid_lat: float
    centroid_lng: float
    habitat_type: str

    model_config = ConfigDict(from_attributes=True)


class ProjectDetail(ProjectOut):
    sites: list[SiteBrief] = []
