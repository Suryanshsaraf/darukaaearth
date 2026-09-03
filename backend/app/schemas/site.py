from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class GeoJSONGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: list[list[list[float]]]  # [[[lng, lat], [lng, lat], ...]]


class SiteCreate(BaseModel):
    project_id: str
    name: str = Field(..., min_length=2, max_length=255)
    description: str | None = None
    habitat_type: str = "Tropical Moist Deciduous"
    established_year: int = Field(default=2022, ge=1990, le=2030)
    geojson: dict[str, Any]  # GeoJSON Geometry or Feature


class SiteUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    habitat_type: str | None = None
    established_year: int | None = None


class SiteOut(BaseModel):
    id: str
    project_id: str
    project_name: str | None = None
    name: str
    description: str | None = None
    habitat_type: str
    area_hectares: float
    centroid_lat: float
    centroid_lng: float
    established_year: int
    geojson: dict[str, Any]
    created_at: datetime
    current_carbon_tco2e: float | None = None
    latest_ndvi: float | None = None
    biodiversity_score: float | None = None

    model_config = ConfigDict(from_attributes=True)


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: str
    geometry: dict[str, Any]
    properties: dict[str, Any]


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: list[GeoJSONFeature]
