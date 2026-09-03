from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    project_type: str = "Reforestation"
    target_carbon_tco2e: float = Field(default=10000.0, ge=0.0)
    status: str = "Active"
    country: str = "India"


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    project_type: Optional[str] = None
    target_carbon_tco2e: Optional[float] = None
    status: Optional[str] = None
    country: Optional[str] = None


class ProjectOut(ProjectBase):
    id: str
    user_id: str
    created_at: datetime
    site_count: int = 0
    total_area_hectares: float = 0.0
    current_carbon_stock_tco2e: float = 0.0

    class Config:
        from_attributes = True


class SiteBrief(BaseModel):
    id: str
    name: str
    area_hectares: float
    centroid_lat: float
    centroid_lng: float
    habitat_type: str

    class Config:
        from_attributes = True


class ProjectDetail(ProjectOut):
    sites: List[SiteBrief] = []
