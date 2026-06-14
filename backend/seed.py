import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import (
    Project, ProjectMembership, Resource,
    SkillRequest, User, Workshop, WorkshopMembership,
)
from utils.karma import CAT_ICON

DEMO_USER = {
    "name": "Morgan R.", "initials": "MR",
    "email": "demo@karma.local", "password_hash": "demo",
    "karma_points": 1240, "level": 4,
    "skills": json.dumps(["Carpentry", "Gardening", "First aid"]),
    "interests": json.dumps(["Garden", "Repair"]),
    "onboarding_complete": True,
}

SEED_PROJECTS = [
    {"cat": "Garden",      "title": "Build raised beds at the Elm St. lot", "place": "Riverside lot",  "when": "Sat 9am",  "karma": 40, "dist": "0.3 mi", "cap": 10, "joined": 6},
    {"cat": "Repair",      "title": "Fix-it café: lamps, chairs & bikes",   "place": "Tool library",   "when": "Sun 2pm",  "karma": 25, "dist": "0.6 mi", "cap": 8,  "joined": 3},
    {"cat": "Cleanup",     "title": "Creek & trail litter sweep",            "place": "Creek path",     "when": "Sat 8am",  "karma": 30, "dist": "1.1 mi", "cap": 20, "joined": 12},
    {"cat": "Skill-share", "title": "Teach & learn: bike maintenance",       "place": "Library room B", "when": "Wed 6pm",  "karma": 20, "dist": "0.9 mi", "cap": 12, "joined": 5},
    {"cat": "Mutual aid",  "title": "Help Mr. Ortiz prep his yard",          "place": "Oak Ave.",       "when": "Sun 10am", "karma": 15, "dist": "0.4 mi", "cap": 4,  "joined": 2},
]

SEED_WORKSHOPS = [
    {"skill": "Sourdough basics",     "cat": "Skill-share", "when": "Thu · Jun 19 · 6pm",  "place": "Maple Kitchen Co-op", "seats": 8,  "taken": 5, "level": "Beginner"},
    {"skill": "Bike tune-up clinic",  "cat": "Repair",      "when": "Sat · Jun 21 · 10am", "place": "Tool Library",        "seats": 12, "taken": 9, "level": "All levels"},
    {"skill": "Container gardening",  "cat": "Garden",      "when": "Sun · Jun 22 · 11am", "place": "Elm St. lot",         "seats": 10, "taken": 4, "level": "Beginner"},
    {"skill": "Intro to woodworking", "cat": "Skill-share", "when": "Wed · Jun 25 · 7pm",  "place": "Community Workshop",  "seats": 6,  "taken": 6, "level": "Beginner"},
]

SEED_SKILL_REQUESTS = [
    {"skill": "Furniture repair",     "count": 14},
    {"skill": "Canning & preserving", "count": 11},
    {"skill": "Basic electrical",     "count": 9},
    {"skill": "Resume help",          "count": 7},
]

SEED_RESOURCES = [
    {"title": "Neighborhood event toolkit",  "description": "A step-by-step PDF for planning your first block event.", "source": "Strong Towns",                 "icon": "flag",   "order": 1},
    {"title": "How to start a tool library", "description": "Local Tools' guide to sharing equipment with neighbors.", "source": "localtools.org",               "icon": "wrench", "order": 2},
    {"title": "Community garden starter",    "description": "Find a plot, organize volunteers, and split the harvest.", "source": "American Community Garden Assn.", "icon": "sprout", "order": 3},
    {"title": "Mutual aid 101",              "description": "What it is, and how to set up a network on your street.", "source": "Mutual Aid Hub",               "icon": "heart",  "order": 4},
    {"title": "Run a repair café",           "description": "The official playbook for hosting fix-it events.",        "source": "Repair Café Intl.",            "icon": "bolt",   "order": 5},
    {"title": "Talking to new neighbors",    "description": "Low-pressure scripts for breaking the ice.",             "source": "Karma guide",                  "icon": "chat",   "order": 6},
]

# How many fake members we might need across all seed data
_MAX_FAKE_MEMBERS = 20


async def seed(db: AsyncSession) -> None:
    result = await db.execute(select(User).limit(1))
    if result.scalar_one_or_none():
        return

    user = User(**DEMO_USER)
    db.add(user)
    await db.flush()

    # Create a pool of anonymous filler users so membership counts match seed data.
    # Each project/workshop has unique (resource_id, user_id) pairs, so we need
    # distinct user rows rather than repeating the same user.
    filler_users: list[User] = []
    for i in range(1, _MAX_FAKE_MEMBERS + 1):
        filler = User(
            name=f"Neighbor {i}", initials=f"N{i}",
            email=f"filler{i}@karma.local", password_hash="filler",
            karma_points=0, level=1,
            skills="[]", interests="[]", onboarding_complete=True,
        )
        db.add(filler)
        filler_users.append(filler)
    await db.flush()

    filler_idx = 0

    for p in SEED_PROJECTS:
        project = Project(
            cat=p["cat"], icon=CAT_ICON[p["cat"]], title=p["title"],
            place=p["place"], when=p["when"], karma=p["karma"],
            dist=p["dist"], cap=p["cap"], host_id=user.id,
        )
        db.add(project)
        await db.flush()
        for _ in range(p["joined"]):
            db.add(ProjectMembership(project_id=project.id, user_id=filler_users[filler_idx % _MAX_FAKE_MEMBERS].id))
            filler_idx += 1

    filler_idx = 0

    for w in SEED_WORKSHOPS:
        workshop = Workshop(
            skill=w["skill"], cat=w["cat"], icon=CAT_ICON.get(w["cat"], "spark"),
            when=w["when"], place=w["place"], seats=w["seats"],
            level=w["level"], host_id=user.id,
        )
        db.add(workshop)
        await db.flush()
        for _ in range(w["taken"]):
            db.add(WorkshopMembership(
                workshop_id=workshop.id,
                user_id=filler_users[filler_idx % _MAX_FAKE_MEMBERS].id,
                on_waitlist=False,
            ))
            filler_idx += 1

    for sr in SEED_SKILL_REQUESTS:
        db.add(SkillRequest(**sr))

    for r in SEED_RESOURCES:
        db.add(Resource(**r))

    await db.commit()
