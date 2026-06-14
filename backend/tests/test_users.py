from tests.conftest import PROJECT_PAYLOAD, WORKSHOP_PAYLOAD


# ---------------------------------------------------------------------------
# Get user  GET /api/users/{id}
# ---------------------------------------------------------------------------

class TestGetUser:
    async def test_returns_user(self, client):
        r = await client.get("/api/users/1")
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == 1
        assert data["name"] == "Test User"
        assert data["initials"] == "TU"
        assert data["karma_points"] == 100

    async def test_level_computed_from_karma(self, client):
        r = await client.get("/api/users/1")
        assert r.json()["level"] == 1  # 100 karma → level 1 (Neighbor, 0–149)

    async def test_badges_empty_by_default(self, client):
        r = await client.get("/api/users/1")
        assert r.json()["badges"] == []

    async def test_optional_fields_null_by_default(self, client):
        r = await client.get("/api/users/1")
        data = r.json()
        assert data["handle"] is None
        assert data["bio"] is None
        assert data["location"] is None
        assert data["helping_status"] is None

    async def test_not_found(self, client):
        r = await client.get("/api/users/9999")
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# Update user  PUT /api/users/{id}
# ---------------------------------------------------------------------------

class TestUpdateUser:
    async def test_update_name(self, client):
        r = await client.put("/api/users/1", json={"name": "Updated Name"})
        assert r.status_code == 200
        assert r.json()["name"] == "Updated Name"

    async def test_update_profile_fields(self, client):
        r = await client.put("/api/users/1", json={
            "handle": "morgan_r",
            "location": "Portland, OR",
            "bio": "Community organizer",
            "helping_status": "Available",
        })
        assert r.status_code == 200
        data = r.json()
        assert data["handle"] == "morgan_r"
        assert data["location"] == "Portland, OR"
        assert data["bio"] == "Community organizer"
        assert data["helping_status"] == "Available"

    async def test_update_skills(self, client):
        r = await client.put("/api/users/1", json={"skills": ["Python", "Gardening"]})
        assert r.status_code == 200
        assert r.json()["skills"] == ["Python", "Gardening"]

    async def test_partial_update_preserves_other_fields(self, client):
        await client.put("/api/users/1", json={"handle": "myhandle"})
        r = await client.put("/api/users/1", json={"bio": "New bio"})
        data = r.json()
        assert data["handle"] == "myhandle"
        assert data["bio"] == "New bio"

    async def test_empty_skills_list_clears_skills(self, client):
        await client.put("/api/users/1", json={"skills": ["Python"]})
        r = await client.put("/api/users/1", json={"skills": []})
        assert r.json()["skills"] == []

    async def test_get_reflects_update(self, client):
        await client.put("/api/users/1", json={"handle": "gh_user"})
        r = await client.get("/api/users/1")
        assert r.json()["handle"] == "gh_user"

    async def test_not_found(self, client):
        r = await client.put("/api/users/9999", json={"name": "Nobody"})
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# User stats  GET /api/users/{id}/stats
# ---------------------------------------------------------------------------

class TestUserStats:
    async def test_empty_user_all_zeros(self, client):
        r = await client.get("/api/users/1/stats")
        assert r.status_code == 200
        data = r.json()
        assert data["projects_joined_count"] == 0
        assert data["projects_created_count"] == 0
        assert data["workshops_hosting_count"] == 0
        assert data["workshops_attending_count"] == 0
        assert data["neighbors_helped_count"] == 0
        assert data["badges_count"] == 0

    async def test_projects_created_increments(self, client):
        await client.post("/api/projects", json=PROJECT_PAYLOAD)
        r = await client.get("/api/users/1/stats")
        assert r.json()["projects_created_count"] == 1

    async def test_workshops_hosting_increments(self, client):
        await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        r = await client.get("/api/users/1/stats")
        assert r.json()["workshops_hosting_count"] == 1

    async def test_workshops_attending_increments_after_join(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        r = await client.get("/api/users/1/stats")
        assert r.json()["workshops_attending_count"] == 1

    async def test_waitlisted_not_counted_as_attending(self, client):
        w = (await client.post("/api/workshops", json={**WORKSHOP_PAYLOAD, "seats": 0})).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        r = await client.get("/api/users/1/stats")
        assert r.json()["workshops_attending_count"] == 0

    async def test_not_found(self, client):
        r = await client.get("/api/users/9999/stats")
        assert r.status_code == 404
