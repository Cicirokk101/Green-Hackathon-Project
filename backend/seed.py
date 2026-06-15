from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import hash_password
from enums import Category, WorkshopLevel
from models import (
    Project, ProjectMembership, Resource,
    SkillRequest, User, Workshop, WorkshopMembership,
)
from utils.karma import CAT_ICON


DEMO_USER = {
    "name": "Morgan R.", "initials": "MR",
    "email": "demo@karma.local", "password_hash": "demo",
    "karma_points": 1240,
    "skills": ["Carpentry", "Gardening", "First aid"],
    "interests": ["Garden", "Repair"],
    "onboarding_complete": True,
}

SEED_SKILL_REQUESTS = [
    {"skill": "Furniture repair",     "count": 14},
    {"skill": "Canning & preserving", "count": 11},
    {"skill": "Basic electrical",     "count": 9},
    {"skill": "Resume help",          "count": 7},
]

SEED_RESOURCES = [
    {"title": "Neighborhood event toolkit",  "description": "A step-by-step PDF for planning your first block event.", "source": "Strong Towns",                   "icon": "flag",   "order": 1},
    {"title": "How to start a tool library", "description": "Local Tools' guide to sharing equipment with neighbors.", "source": "localtools.org",                 "icon": "wrench", "order": 2},
    {"title": "Community garden starter",    "description": "Find a plot, organize volunteers, and split the harvest.", "source": "American Community Garden Assn.", "icon": "sprout", "order": 3},
    {"title": "Mutual aid 101",              "description": "What it is, and how to set up a network on your street.", "source": "Mutual Aid Hub",                 "icon": "heart",  "order": 4},
    {"title": "Run a repair café",           "description": "The official playbook for hosting fix-it events.",        "source": "Repair Café Intl.",              "icon": "bolt",   "order": 5},
    {"title": "Talking to new neighbors",    "description": "Low-pressure scripts for breaking the ice.",             "source": "Karma guide",                    "icon": "chat",   "order": 6},
]

_MAX_FAKE_MEMBERS = 20


async def seed(db: AsyncSession) -> None:
    result = await db.execute(select(User).limit(1))
    if result.scalar_one_or_none():
        return

    now = datetime.now(timezone.utc)

    demo = {**DEMO_USER, "password_hash": hash_password(DEMO_USER["password_hash"])}
    user = User(**demo)
    db.add(user)
    await db.flush()

    filler_users: list[User] = []
    for i in range(1, _MAX_FAKE_MEMBERS + 1):
        filler = User(
            name=f"Neighbor {i}", initials=f"N{i}",
            email=f"filler{i}@karma.local", password_hash="filler",
            karma_points=0,
            skills=[], interests=[],
            onboarding_complete=True,
        )
        db.add(filler)
        filler_users.append(filler)
    await db.flush()

    seed_projects = [
        {"cat": Category.GARDEN,      "title": "Build raised beds at the Elm St. lot", "place": "Riverside lot",  "when": now + timedelta(days=4,  hours=9),  "karma": 40, "cap": 10, "joined": 6},
        {"cat": Category.REPAIR,      "title": "Fix-it café: lamps, chairs & bikes",   "place": "Tool library",   "when": now + timedelta(days=6,  hours=14), "karma": 25, "cap": 8,  "joined": 3},
        {"cat": Category.CLEANUP,     "title": "Creek & trail litter sweep",            "place": "Creek path",     "when": now + timedelta(days=11, hours=8),  "karma": 30, "cap": 20, "joined": 12},
        {"cat": Category.SKILL_SHARE, "title": "Teach & learn: bike maintenance",       "place": "Library room B", "when": now + timedelta(days=2,  hours=18), "karma": 20, "cap": 12, "joined": 5},
        {"cat": Category.MUTUAL_AID,  "title": "Help Mr. Ortiz prep his yard",          "place": "Oak Ave.",       "when": now + timedelta(days=7,  hours=10), "karma": 15, "cap": 4,  "joined": 2},
    ]

    seed_workshops = [
        {"skill": "Sourdough basics",     "cat": Category.SKILL_SHARE, "when": now + timedelta(days=5,  hours=18), "place": "Maple Kitchen Co-op", "seats": 8,  "taken": 5, "level": WorkshopLevel.BEGINNER},
        {"skill": "Bike tune-up clinic",  "cat": Category.REPAIR,      "when": now + timedelta(days=7,  hours=10), "place": "Tool Library",        "seats": 12, "taken": 9, "level": WorkshopLevel.ALL_LEVELS},
        {"skill": "Container gardening",  "cat": Category.GARDEN,      "when": now + timedelta(days=8,  hours=11), "place": "Elm St. lot",         "seats": 10, "taken": 4, "level": WorkshopLevel.BEGINNER},
        {"skill": "Intro to woodworking", "cat": Category.SKILL_SHARE, "when": now + timedelta(days=11, hours=19), "place": "Community Workshop",  "seats": 6,  "taken": 6, "level": WorkshopLevel.BEGINNER},
    ]

    filler_idx = 0

    for p in seed_projects:
        project = Project(
            cat=p["cat"], title=p["title"],
            place=p["place"], when=p["when"], karma=p["karma"],
            cap=p["cap"], host_id=user.id,
        )
        db.add(project)
        await db.flush()
        for _ in range(p["joined"]):
            db.add(ProjectMembership(project_id=project.id, user_id=filler_users[filler_idx % _MAX_FAKE_MEMBERS].id))
            filler_idx += 1

    filler_idx = 0

    for w in seed_workshops:
        workshop = Workshop(
            skill=w["skill"], cat=w["cat"],
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
