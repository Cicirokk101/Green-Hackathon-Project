from tests.conftest import PROJECT_PAYLOAD


# ---------------------------------------------------------------------------
# List projects  GET /api/projects
# ---------------------------------------------------------------------------

class TestListProjects:
    async def test_empty_returns_zero_total(self, client):
        r = await client.get("/api/projects")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] == 0
        assert data["items"] == []

    async def test_lists_created_project(self, client):
        await client.post("/api/projects", json=PROJECT_PAYLOAD)
        r = await client.get("/api/projects")
        data = r.json()
        assert data["total"] == 1
        assert data["items"][0]["title"] == PROJECT_PAYLOAD["title"]

    async def test_filter_by_category_matches(self, client):
        await client.post("/api/projects", json=PROJECT_PAYLOAD)
        await client.post("/api/projects", json={**PROJECT_PAYLOAD, "cat": "Cleanup", "title": "Park cleanup"})
        r = await client.get("/api/projects?cat=Garden")
        data = r.json()
        assert data["total"] == 1
        assert data["items"][0]["cat"] == "Garden"

    async def test_filter_by_category_no_match(self, client):
        await client.post("/api/projects", json=PROJECT_PAYLOAD)
        r = await client.get("/api/projects?cat=Repair")
        assert r.json()["total"] == 0

    async def test_project_computed_defaults(self, client):
        await client.post("/api/projects", json=PROJECT_PAYLOAD)
        item = (await client.get("/api/projects")).json()["items"][0]
        assert item["joined"] == 0
        assert item["pct"] == 0
        assert item["bookmarked"] is False

    async def test_is_mine_true_for_host(self, client):
        await client.post("/api/projects", json=PROJECT_PAYLOAD)
        item = (await client.get("/api/projects")).json()["items"][0]
        assert item["is_mine"] is True

    async def test_host_info_present(self, client):
        await client.post("/api/projects", json=PROJECT_PAYLOAD)
        item = (await client.get("/api/projects")).json()["items"][0]
        assert item["host"] == "TU"
        assert item["host_name"] == "Test User"


# ---------------------------------------------------------------------------
# Create project  POST /api/projects
# ---------------------------------------------------------------------------

class TestCreateProject:
    async def test_returns_201(self, client):
        r = await client.post("/api/projects", json=PROJECT_PAYLOAD)
        assert r.status_code == 201

    async def test_response_fields(self, client):
        r = await client.post("/api/projects", json=PROJECT_PAYLOAD)
        data = r.json()
        assert data["id"] is not None
        assert data["cat"] == "Garden"
        assert data["title"] == PROJECT_PAYLOAD["title"]
        assert data["karma"] == 40
        assert data["cap"] == 10
        assert data["joined"] == 0
        assert data["pct"] == 0
        assert data["bookmarked"] is False
        assert data["is_mine"] is True

    async def test_icon_assigned_from_category(self, client):
        r = await client.post("/api/projects", json=PROJECT_PAYLOAD)
        assert r.json()["icon"] == "sprout"  # Garden

    async def test_cat_icon_mapping(self, client):
        mapping = {
            "Garden": "sprout",
            "Cleanup": "trend",
            "Repair": "wrench",
            "Skill-share": "bulb",
            "Mutual aid": "heart",
        }
        for cat, expected_icon in mapping.items():
            r = await client.post("/api/projects", json={**PROJECT_PAYLOAD, "cat": cat, "title": f"{cat} project"})
            assert r.json()["icon"] == expected_icon, f"Wrong icon for {cat}"

    async def test_unknown_cat_defaults_to_sprout(self, client):
        r = await client.post("/api/projects", json={**PROJECT_PAYLOAD, "cat": "Unknown"})
        assert r.json()["icon"] == "sprout"

    async def test_optional_desc_can_be_omitted(self, client):
        payload = {k: v for k, v in PROJECT_PAYLOAD.items() if k != "desc"}
        r = await client.post("/api/projects", json=payload)
        assert r.status_code == 201
        assert r.json()["desc"] is None

    async def test_zero_cap_no_division_error(self, client):
        r = await client.post("/api/projects", json={**PROJECT_PAYLOAD, "cap": 0})
        assert r.status_code == 201
        assert r.json()["pct"] == 0

    async def test_multiple_projects_get_unique_ids(self, client):
        r1 = await client.post("/api/projects", json=PROJECT_PAYLOAD)
        r2 = await client.post("/api/projects", json={**PROJECT_PAYLOAD, "title": "Another"})
        assert r1.json()["id"] != r2.json()["id"]


# ---------------------------------------------------------------------------
# Join project  POST /api/projects/{id}/join
# ---------------------------------------------------------------------------

class TestJoinProject:
    async def test_join_returns_success_true(self, client):
        p = (await client.post("/api/projects", json=PROJECT_PAYLOAD)).json()
        r = await client.post(f"/api/projects/{p['id']}/join")
        assert r.status_code == 200
        assert r.json()["success"] is True

    async def test_join_increments_joined_count(self, client):
        p = (await client.post("/api/projects", json=PROJECT_PAYLOAD)).json()
        r = await client.post(f"/api/projects/{p['id']}/join")
        assert r.json()["joined"] == 1

    async def test_join_pct_calculation(self, client):
        p = (await client.post("/api/projects", json={**PROJECT_PAYLOAD, "cap": 4})).json()
        r = await client.post(f"/api/projects/{p['id']}/join")
        assert r.json()["pct"] == 25  # 1/4 * 100

    async def test_join_pct_with_ten_cap(self, client):
        p = (await client.post("/api/projects", json=PROJECT_PAYLOAD)).json()
        r = await client.post(f"/api/projects/{p['id']}/join")
        assert r.json()["pct"] == 10  # 1/10 * 100

    async def test_join_zero_cap_pct_is_zero(self, client):
        p = (await client.post("/api/projects", json={**PROJECT_PAYLOAD, "cap": 0})).json()
        r = await client.post(f"/api/projects/{p['id']}/join")
        assert r.status_code == 200
        assert r.json()["pct"] == 0

    async def test_duplicate_join_is_idempotent(self, client):
        p = (await client.post("/api/projects", json=PROJECT_PAYLOAD)).json()
        await client.post(f"/api/projects/{p['id']}/join")
        r2 = await client.post(f"/api/projects/{p['id']}/join")
        assert r2.status_code == 200
        assert r2.json()["joined"] == 1  # still 1, not 2

    async def test_join_not_found(self, client):
        r = await client.post("/api/projects/9999/join")
        assert r.status_code == 404

    async def test_join_reflected_in_list(self, client):
        p = (await client.post("/api/projects", json=PROJECT_PAYLOAD)).json()
        await client.post(f"/api/projects/{p['id']}/join")
        item = (await client.get("/api/projects")).json()["items"][0]
        assert item["joined"] == 1
        assert item["pct"] == 10


# ---------------------------------------------------------------------------
# Bookmark  POST /api/projects/{id}/bookmark
# ---------------------------------------------------------------------------

class TestBookmarkProject:
    async def test_first_call_bookmarks(self, client):
        p = (await client.post("/api/projects", json=PROJECT_PAYLOAD)).json()
        r = await client.post(f"/api/projects/{p['id']}/bookmark")
        assert r.status_code == 200
        assert r.json()["bookmarked"] is True

    async def test_second_call_unbookmarks(self, client):
        p = (await client.post("/api/projects", json=PROJECT_PAYLOAD)).json()
        pid = p["id"]
        await client.post(f"/api/projects/{pid}/bookmark")
        r = await client.post(f"/api/projects/{pid}/bookmark")
        assert r.json()["bookmarked"] is False

    async def test_toggle_sequence(self, client):
        p = (await client.post("/api/projects", json=PROJECT_PAYLOAD)).json()
        pid = p["id"]
        states = []
        for _ in range(4):
            r = await client.post(f"/api/projects/{pid}/bookmark")
            states.append(r.json()["bookmarked"])
        assert states == [True, False, True, False]

    async def test_bookmark_reflected_in_list(self, client):
        p = (await client.post("/api/projects", json=PROJECT_PAYLOAD)).json()
        await client.post(f"/api/projects/{p['id']}/bookmark")
        item = (await client.get("/api/projects")).json()["items"][0]
        assert item["bookmarked"] is True

    async def test_unbookmark_reflected_in_list(self, client):
        p = (await client.post("/api/projects", json=PROJECT_PAYLOAD)).json()
        pid = p["id"]
        await client.post(f"/api/projects/{pid}/bookmark")
        await client.post(f"/api/projects/{pid}/bookmark")
        item = (await client.get("/api/projects")).json()["items"][0]
        assert item["bookmarked"] is False

    async def test_bookmark_not_found(self, client):
        r = await client.post("/api/projects/9999/bookmark")
        assert r.status_code == 404
