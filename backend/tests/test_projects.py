def test_create_and_list_project(client, auth_headers):
    # 1. Create project
    create_resp = client.post(
        "/api/v1/projects/",
        headers=auth_headers,
        json={
            "name": "Nilgiri Biosphere Restoration",
            "description": "Restoration of montane shola-grassland ecosystems in Tamil Nadu.",
            "project_type": "Reforestation",
            "target_carbon_tco2e": 15000.0,
            "status": "Active",
            "country": "India",
        },
    )
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    assert created_data["name"] == "Nilgiri Biosphere Restoration"
    project_id = created_data["id"]

    # 2. List projects
    list_resp = client.get("/api/v1/projects/", headers=auth_headers)
    assert list_resp.status_code == 200
    projects = list_resp.json()
    assert any(p["id"] == project_id for p in projects)

    # 3. Get single project
    detail_resp = client.get(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    assert detail_data["id"] == project_id
    assert "sites" in detail_data

    # 4. Delete project
    del_resp = client.delete(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    # Verify not found after deletion
    get_again = client.get(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert get_again.status_code == 404
