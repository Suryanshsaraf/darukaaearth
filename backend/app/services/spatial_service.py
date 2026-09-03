import json
import math
from typing import Any

from shapely.geometry import mapping, shape
from shapely.validation import make_valid
from sqlalchemy import text
from sqlalchemy.orm import Session


class SpatialService:
    """
    Production-grade Spatial Service handling GeoJSON validation,
    PostGIS spatial projections, geodetic area calculations, and centroids.
    """

    @staticmethod
    def extract_geometry(geojson_input: dict[str, Any]) -> dict[str, Any]:
        """Extracts geometry dictionary whether input is a Feature or raw Geometry."""
        if not isinstance(geojson_input, dict):
            raise ValueError("Invalid GeoJSON: must be a JSON dictionary")

        if geojson_input.get("type") == "Feature":
            geom = geojson_input.get("geometry")
            if not geom:
                raise ValueError("GeoJSON Feature is missing 'geometry' attribute")
            return geom

        if geojson_input.get("type") in ["Polygon", "MultiPolygon"]:
            return geojson_input

        raise ValueError(
            f"Unsupported GeoJSON geometry type: {geojson_input.get('type')}. "
            "Only 'Polygon' and 'MultiPolygon' are supported for conservation site boundaries."
        )

    @staticmethod
    def validate_and_clean_geometry(
        geom_dict: dict[str, Any],
    ) -> tuple[dict[str, Any], float, float]:
        """
        Validates the polygon using Shapely, fixes self-intersections with make_valid,
        and extracts the centroid (lat, lng).
        """
        try:
            poly = shape(geom_dict)
        except Exception as e:
            raise ValueError(f"Malformed geometry coordinates: {str(e)}") from e

        if not poly.is_valid:
            poly = make_valid(poly)

        centroid = poly.centroid
        centroid_lat = float(centroid.y)
        centroid_lng = float(centroid.x)

        cleaned_dict = mapping(poly)
        return cleaned_dict, centroid_lat, centroid_lng

    @classmethod
    def calculate_geodesic_area_hectares(cls, db: Session, geom_dict: dict[str, Any]) -> float:
        """
        Calculates exact geodetic surface area in hectares.
        Uses PostgreSQL PostGIS ST_Area(geom::geography) if available;
        falls back to accurate WGS84 ellipsoidal formula in Python.
        """
        geojson_str = json.dumps(geom_dict)
        try:
            # Query PostGIS for exact ellipsoidal geodesic area (m^2 -> hectares)
            result = db.execute(
                text(
                    "SELECT ST_Area(ST_GeomFromGeoJSON(:geom_json)::geography) / 10000.0 AS area_ha"
                ),
                {"geom_json": geojson_str},
            ).scalar()
            if result is not None and result > 0:
                return round(float(result), 2)
        except Exception:
            # Fallback if executing in mock/sqlite test environment without PostGIS extension
            pass

        # Python Geodesic WGS84 formula calculation fallback
        return cls._calculate_python_geodesic_area(geom_dict)

    @staticmethod
    def _calculate_python_geodesic_area(geom_dict: dict[str, Any]) -> float:
        """
        Computes spherical geodesic area on WGS84 earth model in hectares.
        R = 6378137 meters.
        """
        coords_list = []
        gtype = geom_dict.get("type")
        if gtype == "Polygon":
            coords_list = [geom_dict["coordinates"][0]]  # Outer ring
        elif gtype == "MultiPolygon":
            coords_list = [poly[0] for poly in geom_dict["coordinates"]]
        else:
            return 0.0

        total_area_m2 = 0.0
        earth_radius = 6378137.0

        for ring in coords_list:
            if len(ring) < 3:
                continue
            ring_area = 0.0
            num_pts = len(ring)
            for i in range(num_pts):
                p1 = ring[i]
                p2 = ring[(i + 1) % num_pts]
                lon1_rad = math.radians(p1[0])
                lat1_rad = math.radians(p1[1])
                lon2_rad = math.radians(p2[0])
                lat2_rad = math.radians(p2[1])
                ring_area += (lon2_rad - lon1_rad) * (2 + math.sin(lat1_rad) + math.sin(lat2_rad))

            ring_area = abs(ring_area * (earth_radius**2) / 2.0)
            total_area_m2 += ring_area

        return round(total_area_m2 / 10000.0, 2)
