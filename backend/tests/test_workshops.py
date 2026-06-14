from tests.conftest import WORKSHOP_PAYLOAD


# ---------------------------------------------------------------------------
# List workshops  GET /api/workshops
# ---------------------------------------------------------------------------

class TestListWorkshops:
    async def test_empty_returns_empty_list(self, client):
        r = await client.get("/api/workshops")
        assert r.status_code == 200
        assert r.json() == []

    async def test_no_filters_returns_all(self, client):
        await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        r = await client.get("/api/workshops")
        assert len(r.json()) == 1

    async def test_host_id_filter(self, client):
        await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        r = await client.get("/api/workshops?host_id=1")
        data = r.json()
        assert len(data) == 1
        assert data[0]["is_mine"] is True

    async def test_host_id_filter_no_match(self, client):
        await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        r = await client.get("/api/workshops?host_id=9999")
        assert r.json() == []

    async def test_attendee_id_filter_empty_before_joining(self, client):
        await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)
        r = await client.get("/api/workshops?attendee_id=1")
        assert r.json() == []

    async def test_attendee_id_filter_shows_joined_workshop(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        r = await client.get("/api/workshops?attendee_id=1")
        data = r.json()
        assert len(data) == 1
        assert data[0]["attending"] is True

    async def test_attendee_id_excludes_waitlisted(self, client):
        w = (await client.post("/api/workshops", json={**WORKSHOP_PAYLOAD, "seats": 0})).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        r = await client.get("/api/workshops?attendee_id=1")
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
        assert w["host_initials"] == "TU"
        assert w["host_name"] == "Test User"
        assert w["host_id"] == 1
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

    async def test_invalid_cat_returns_422(self, client):
        r = await client.post("/api/workshops", json={**WORKSHOP_PAYLOAD, "cat": "Unknown"})
        assert r.status_code == 422

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
# Get workshop  GET /api/workshops/{id}
# ---------------------------------------------------------------------------

class TestGetWorkshop:
    async def test_returns_workshop(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        r = await client.get(f"/api/workshops/{w['id']}")
        assert r.status_code == 200
        assert r.json()["id"] == w["id"]
        assert r.json()["skill"] == WORKSHOP_PAYLOAD["skill"]

    async def test_not_found(self, client):
        r = await client.get("/api/workshops/9999")
        assert r.status_code == 404

    async def test_attending_reflects_join(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        r = await client.get(f"/api/workshops/{w['id']}")
        assert r.json()["attending"] is True
        assert r.json()["taken"] == 1


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
        assert item["taken"] == 1

    async def test_join_not_found(self, client):
        r = await client.post("/api/workshops/9999/join")
        assert r.status_code == 404

    async def test_full_flag_updates_after_join(self, client):
        w = (await client.post("/api/workshops", json={**WORKSHOP_PAYLOAD, "seats": 1})).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        item = (await client.get("/api/workshops")).json()[0]
        assert item["full"] is True
        assert item["seats_left"] == 0


# ---------------------------------------------------------------------------
# Leave workshop  DELETE /api/workshops/{id}/join
# ---------------------------------------------------------------------------

class TestLeaveWorkshop:
    async def test_leave_after_joining(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        r = await client.delete(f"/api/workshops/{w['id']}/join")
        assert r.status_code == 200
        assert r.json()["success"] is True

    async def test_leave_frees_seat(self, client):
        w = (await client.post("/api/workshops", json={**WORKSHOP_PAYLOAD, "seats": 1})).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        r = await client.delete(f"/api/workshops/{w['id']}/join")
        assert r.json()["seats_left"] == 1

    async def test_leave_reflected_in_list(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        await client.delete(f"/api/workshops/{w['id']}/join")
        item = (await client.get("/api/workshops")).json()[0]
        assert item["attending"] is False
        assert item["taken"] == 0

    async def test_leave_when_not_joined_is_ok(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        r = await client.delete(f"/api/workshops/{w['id']}/join")
        assert r.status_code == 200

    async def test_leave_not_found(self, client):
        r = await client.delete("/api/workshops/9999/join")
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# Join status  GET /api/workshops/{id}/join/me
# ---------------------------------------------------------------------------

class TestJoinStatus:
    async def test_not_joined(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        r = await client.get(f"/api/workshops/{w['id']}/join/me")
        assert r.status_code == 200
        assert r.json() == {"joined": False, "on_waitlist": False}

    async def test_joined(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        r = await client.get(f"/api/workshops/{w['id']}/join/me")
        assert r.json() == {"joined": True, "on_waitlist": False}

    async def test_on_waitlist(self, client):
        w = (await client.post("/api/workshops", json={**WORKSHOP_PAYLOAD, "seats": 0})).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        r = await client.get(f"/api/workshops/{w['id']}/join/me")
        assert r.json() == {"joined": True, "on_waitlist": True}

    async def test_left_shows_not_joined(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        await client.delete(f"/api/workshops/{w['id']}/join")
        r = await client.get(f"/api/workshops/{w['id']}/join/me")
        assert r.json() == {"joined": False, "on_waitlist": False}

    async def test_not_found(self, client):
        r = await client.get("/api/workshops/9999/join/me")
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# Update workshop  PATCH /api/workshops/{id}
# ---------------------------------------------------------------------------

class TestUpdateWorkshop:
    async def test_update_skill(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        r = await client.patch(f"/api/workshops/{w['id']}", json={"skill": "Advanced sourdough"})
        assert r.status_code == 200
        assert r.json()["skill"] == "Advanced sourdough"

    async def test_update_seats(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        r = await client.patch(f"/api/workshops/{w['id']}", json={"seats": 20})
        assert r.json()["seats"] == 20
        assert r.json()["seats_left"] == 20

    async def test_update_category_changes_icon(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        r = await client.patch(f"/api/workshops/{w['id']}", json={"cat": "Garden"})
        assert r.json()["cat"] == "Garden"
        assert r.json()["icon"] == "sprout"

    async def test_partial_update_preserves_other_fields(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        r = await client.patch(f"/api/workshops/{w['id']}", json={"skill": "New skill"})
        assert r.json()["seats"] == WORKSHOP_PAYLOAD["seats"]
        assert r.json()["level"] == WORKSHOP_PAYLOAD["level"]

    async def test_empty_body_is_ok(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        r = await client.patch(f"/api/workshops/{w['id']}", json={})
        assert r.status_code == 200

    async def test_not_found(self, client):
        r = await client.patch("/api/workshops/9999", json={"skill": "New"})
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# Delete workshop  DELETE /api/workshops/{id}
# ---------------------------------------------------------------------------

class TestDeleteWorkshop:
    async def test_delete_returns_204(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        r = await client.delete(f"/api/workshops/{w['id']}")
        assert r.status_code == 204

    async def test_deleted_workshop_not_in_list(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.delete(f"/api/workshops/{w['id']}")
        r = await client.get("/api/workshops")
        assert r.json() == []

    async def test_delete_also_removes_memberships(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.post(f"/api/workshops/{w['id']}/join")
        await client.delete(f"/api/workshops/{w['id']}")
        # Re-creating a workshop should start with 0 members
        w2 = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        assert w2["taken"] == 0

    async def test_not_found(self, client):
        r = await client.delete("/api/workshops/9999")
        assert r.status_code == 404

    async def test_get_after_delete_returns_404(self, client):
        w = (await client.post("/api/workshops", json=WORKSHOP_PAYLOAD)).json()
        await client.delete(f"/api/workshops/{w['id']}")
        r = await client.get(f"/api/workshops/{w['id']}")
        assert r.status_code == 404
