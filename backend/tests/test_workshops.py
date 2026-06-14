from tests.conftest import WORKSHOP_PAYLOAD


# ---------------------------------------------------------------------------
# List workshops  GET /api/workshops
# ---------------------------------------------------------------------------

class TestListWorkshops:
    async def test_empty_upcoming(self, client):
        r = await client.get("/api/workshops")
        assert r.status_code == 200
        assert r.json() == []

    async def test_default_tab_is_upcoming(self, client):
        await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        r = await client.get("/api/workshops")
        assert len(r.json()) == 1

    async def test_upcoming_tab_explicit(self, client):
        await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        r = await client.get("/api/workshops?tab=upcoming")
        assert len(r.json()) == 1

    async def test_hosting_tab_shows_own_workshops(self, client):
        await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        r = await client.get("/api/workshops?tab=hosting")
        data = r.json()
        assert len(data) == 1
        assert data[0]["is_mine"] is True

    async def test_attending_tab_empty_before_joining(self, client):
        await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        r = await client.get("/api/workshops?tab=attending")
        assert r.json() == []

    async def test_attending_tab_shows_joined_workshop(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        r = await client.get("/api/workshops?tab=attending")
        data = r.json()
        assert len(data) == 1
        assert data[0]["attending"] is True

    async def test_attending_excludes_waitlisted(self, client):
        # 0-seat workshop → joining puts user on waitlist
        w = (await client.post("/api/workshops", json={**WORKSHOP_PAYLOAD, "seats": 0})).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        r = await client.get("/api/workshops?tab=attending")
        assert r.json() == []

    async def test_past_tab_always_empty(self, client):
        await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        r = await client.get("/api/workshops?tab=past")
        assert r.json() == []

    async def test_workshop_computed_defaults(self, client):
        await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        w = (await client.get("/api/workshops")).json()[0]
        assert w["taken"] == 0
        assert w["seats_left"] == 8
        assert w["full"] is False
        assert w["attending"] is False

    async def test_host_info_present(self, client):
        await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        w = (await client.get("/api/workshops")).json()[0]
        assert w["host"] == "TU"
        assert w["host_name"] == "Test User"
        assert w["is_mine"] is True


# ---------------------------------------------------------------------------
# Create workshop  POST /api/workshops
# ---------------------------------------------------------------------------

class TestCreateWorkshop:
    async def test_returns_201(self, client):
        r = await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        assert r.status_code == 201

    async def test_response_fields(self, client):
        r = await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        data = r.json()
        assert data["id"] is not None
        assert data["skill"] == WORKSHOP_PAYLOAD["skill"]
        assert data["cat"] == "Skill-share"
        assert data["seats"] == 8
        assert data["level"] == "Beginner"
        assert data["taken"] == 0
        assert data["seats_left"] == 8
        assert data["full"] is False
        assert data["attending"] is False
        assert data["is_mine"] is True

    async def test_icon_assigned_from_category(self, client):
        r = await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        assert r.json()["icon"] == "bulb"  # Skill-share

    async def test_cat_icon_mapping(self, client):
        mapping = {
            "Garden": "sprout",
            "Cleanup": "trend",
            "Repair": "wrench",
            "Skill-share": "bulb",
            "Mutual aid": "heart",
        }
        for cat, expected_icon in mapping.items():
            r = await client.post("/api/workshops", json={**WORKSHOP_PAYLOAD, "cat": cat, "skill": f"{cat} skill"})
            assert r.json()["icon"] == expected_icon, f"Wrong icon for {cat}"

    async def test_unknown_cat_defaults_to_bulb(self, client):
        r = await client.post("/api/workshops", json={**WORKSHOP_PAYLOAD, "cat": "Unknown"})
        assert r.json()["icon"] == "bulb"

    async def test_zero_seats_shows_full(self, client):
        r = await client.post("/api/workshops", json={**WORKSHOP_PAYLOAD, "seats": 0})
        assert r.status_code == 201
        data = r.json()
        assert data["seats"] == 0
        assert data["seats_left"] == 0
        assert data["full"] is True

    async def test_multiple_workshops_get_unique_ids(self, client):
        r1 = await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        r2 = await client.post("/api/workshops", json={**WORKSHOP_PAYLOAD, "skill": "Another skill"})
        assert r1.json()["id"] != r2.json()["id"]


# ---------------------------------------------------------------------------
# Join workshop  POST /api/workshops/{id}/join
# ---------------------------------------------------------------------------

class TestJoinWorkshop:
    async def test_join_returns_success_true(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        r = await client.post(f"/api/workshops/{w['id']}/join")
        assert r.status_code == 200
        assert r.json()["success"] is True

    async def test_join_not_on_waitlist_when_seats_available(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        r = await client.post(f"/api/workshops/{w['id']}/join")
        assert r.json()["on_waitlist"] is False

    async def test_join_seats_left_reflects_pre_join_count(self, client):
        # The endpoint counts taken BEFORE adding the new member,
        # so seats_left in the join response = seats - taken_before_join
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        r = await client.post(f"/api/workshops/{w['id']}/join")
        # taken was 0 before join → seats_left = 8 - 0 = 8
        assert r.json()["seats_left"] == 8

    async def test_join_reflected_in_list(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        item = (await client.get("/api/workshops")).json()[0]
        assert item["taken"] == 1
        assert item["seats_left"] == 7
        assert item["attending"] is True

    async def test_join_full_workshop_goes_to_waitlist(self, client):
        # Workshop with 0 seats is immediately full
        w = (await client.post("/api/workshops", json={**WORKSHOP_PAYLOAD, "seats": 0})).json()
        r = await client.post(f"/api/workshops/{w['id']}/join")
        assert r.json()["on_waitlist"] is True
        assert r.json()["seats_left"] == 0

    async def test_duplicate_join_is_idempotent(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        r2 = await client.post(f"/api/workshops/{w['id']}/join")
        assert r2.status_code == 200
        assert r2.json()["success"] is True

    async def test_duplicate_join_does_not_double_count(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        await client.post(f"/api/workshops/{w['id']}/join")
        item = (await client.get("/api/workshops")).json()[0]
        assert item["taken"] == 1  # still 1, not 2

    async def test_join_not_found(self, client):
        r = await client.post("/api/workshops/9999/join")
        assert r.status_code == 404

    async def test_full_flag_updates_after_join(self, client):
        # Single-seat workshop becomes full after one join
        w = (await client.post("/api/workshops", json={**WORKSHOP_PAYLOAD, "seats": 1})).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        item = (await client.get("/api/workshops")).json()[0]
        assert item["full"] is True
        assert item["seats_left"] == 0
