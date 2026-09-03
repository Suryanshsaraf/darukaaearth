from app.services.spatial_service import SpatialService


def test_spatial_polygon_validation_and_area():
    # Valid square polygon approx 0.01 deg x 0.01 deg (~1.2 km x 1.1 km)
    test_geojson = {
        "type": "Polygon",
        "coordinates": [
            [
                [77.0, 28.0],
                [77.01, 28.0],
                [77.01, 28.01],
                [77.0, 28.01],
                [77.0, 28.0],
            ]
        ],
    }

    geom = SpatialService.extract_geometry(test_geojson)
    assert geom["type"] == "Polygon"

    cleaned, lat, lng = SpatialService.validate_and_clean_geometry(geom)
    assert round(lat, 2) == 28.01 or round(lat, 2) == 28.00
    assert round(lng, 2) == 77.00 or round(lng, 2) == 77.01

    area_ha = SpatialService._calculate_python_geodesic_area(cleaned)
    assert area_ha > 0.0
    # Expected area of ~1km^2 is ~100-120 hectares
    assert 80.0 < area_ha < 150.0


def test_create_site_from_polygon_endpoint(client, auth_headers):
    # 1. Create a parent project first
    proj_resp = client.post(
        "/api/v1/projects/",
        headers=auth_headers,
        json={
            "name": "Kaziranga Ecological Corridor",
            "project_type": "Reforestation",
            "target_carbon_tco2e": 20000.0,
        },
    )
    assert proj_resp.status_code == 201
    project_id = proj_resp.json()["id"]

    # 2. Submit polygon site
    polygon_payload = {
        "project_id": project_id,
        "name": "Brahmaputra Floodplain Buffer",
        "description": "Alluvial grasslands and wetland buffer",
        "habitat_type": "Peatland / Wetland",
        "established_year": 2022,
        "geojson": {
            "type": "Polygon",
            "coordinates": [
                [
                    [93.15, 26.58],
                    [93.19, 26.59],
                    [93.20, 26.56],
                    [93.16, 26.55],
                    [93.15, 26.58],
                ]
            ],
        },
    }

    site_resp = client.post("/api/v1/sites/", headers=auth_headers, json=polygon_payload)
    assert site_resp.status_code == 201
    site_data = site_resp.json()
    assert site_data["name"] == "Brahmaputra Floodplain Buffer"
    assert site_data["area_hectares"] > 0
    assert site_data["current_carbon_tco2e"] is not None

    site_id = site_data["id"]

    # 3. Verify GeoJSON FeatureCollection endpoint
    geojson_resp = client.get("/api/v1/sites/geojson", headers=auth_headers)
    assert geojson_resp.status_code == 200
    fc = geojson_resp.json()
    assert fc["type"] == "FeatureCollection"
    assert any(f["id"] == site_id for f in fc["features"])

    # 4. Verify time-series analytics endpoint
    analytics_resp = client.get(f"/api/v1/analytics/{site_id}", headers=auth_headers)
    assert analytics_resp.status_code == 200
    analytics_data = analytics_resp.json()
    assert len(analytics_data["history"]) == 36
    assert "carbon_stock" in analytics_data["highcharts_series"]
    assert "ndvi" in analytics_data["highcharts_series"]
