from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class GeoJSONGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]  # [[[lng, lat], [lng, lat], ...]]


class SiteCreate(BaseModel):
    project_id: str
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    habitat_type: str = "Tropical Moist Deciduous"
    established_year: int = Field(default=2022, ge=1990, le=2030)
    geojson: Dict[str, Any]  # GeoJSON Geometry or Feature


class SiteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    habitat_type: Optional[str] = None
    established_year: Optional[int] = None


class SiteOut(BaseModel):
    id: str
    project_id: str
    project_name: Optional[str] = None
    name: str
    description: Optional[str] = None
    habitat_type: str
    area_hectares: float
    centroid_lat: float
    centroid_lng: float
    established_year: int
    geojson: Dict[str, Any]
    created_at: datetime
    current_carbon_tco2e: Optional[float] = None
    latest_ndvi: Optional[float] = None
    biodiversity_score: Optional[float] = None

    class Config:
        from_attributes = True


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: str
    geometry: Dict[str, Any]
    properties: Dict[str, Any]


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]
