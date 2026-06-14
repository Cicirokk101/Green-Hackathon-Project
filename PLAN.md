# Implementation Plan — Projects & Workshops Endpoints

## Scope

Build the Projects and Workshops backend endpoints.
Auth is stubbed (`STUB_USER_ID = 1`) for now — slots in cleanly once auth is wired.

---

## Status

**All 6 planned steps are complete.** The following extras were also shipped:

| Extra file | What it does |
|---|---|
| `backend/config.py` | Pydantic-settings (`Settings`) — DB URL, CORS origins, debug flag |
| `backend/database.py` | Async SQLAlchemy engine + `get_db` dependency |
| `backend/routers/misc.py` | `GET /api/skills/requested` and `GET /api/resources` |
| `backend/tests/conftest.py` | Shared pytest fixtures (in-memory SQLite client, stub user) |
| `backend/tests/test_health.py` | Health check test |
| `backend/tests/test_projects.py` | 23 tests covering all 4 project endpoints |
| `backend/tests/test_workshops.py` | 18+ tests covering all 3 workshop endpoints |

---

## Build Order

```
1. ✅ models.py          — DB tables, must exist before anything else
2. ✅ utils/karma.py     — shared constants + helpers
3. ✅ schemas/
        projects.py      — request/response shapes for projects
        workshops.py     — request/response shapes for workshops
4. ✅ seed.py            — demo data so the app loads with content
5. ✅ routers/
        projects.py      — 4 project endpoints
        workshops.py     — 3 workshop endpoints
6. ✅ main.py            — register routers + startup hook
```

---

## Endpoints Being Built

### Projects
| Method | Path | What it does |
|---|---|---|
| GET | `/api/projects` | List projects, optional `?cat=` filter |
| POST | `/api/projects` | Create a project |
| POST | `/api/projects/{id}/join` | Join a project (idempotent) |
| POST | `/api/projects/{id}/bookmark` | Toggle bookmark |

### Workshops
| Method | Path | What it does |
|---|---|---|
| GET | `/api/workshops` | List workshops, optional `?tab=` filter |
| POST | `/api/workshops` | Host a new workshop |
| POST | `/api/workshops/{id}/join` | Reserve seat or join waitlist |

---

## Step 1 — `backend/models.py`

```python
from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    initials: Mapped[str] = mapped_column(String(10), nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    karma_points: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)
    skills: Mapped[str] = mapped_column(Text, default="[]")     # JSON array string
    interests: Mapped[str] = mapped_column(Text, default="[]")  # JSON array string
    onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False)

    projects_hosted: Mapped[list[Project]] = relationship(
        "Project", back_populates="host", foreign_keys="Project.host_id"
    )
    project_memberships: Mapped[list[ProjectMembership]] = relationship(
        "ProjectMembership", back_populates="user"
    )
    project_bookmarks: Mapped[list[ProjectBookmark]] = relationship(
        "ProjectBookmark", back_populates="user"
    )
    workshops_hosted: Mapped[list[Workshop]] = relationship(
        "Workshop", back_populates="host"
    )
    workshop_memberships: Mapped[list[WorkshopMembership]] = relationship(
        "WorkshopMembership", back_populates="user"
    )


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cat: Mapped[str] = mapped_column(String, nullable=False)
    icon: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    desc: Mapped[str | None] = mapped_column(Text, nullable=True)
    place: Mapped[str] = mapped_column(String, nullable=False)
    when: Mapped[str] = mapped_column(String, nullable=False)
    karma: Mapped[int] = mapped_column(Integer, nullable=False)
    host_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    dist: Mapped[str] = mapped_column(String, default="0.0 mi")
    cap: Mapped[int] = mapped_column(Integer, nullable=False)

    host: Mapped[User] = relationship(
        "User", back_populates="projects_hosted", foreign_keys=[host_id]
    )
    memberships: Mapped[list[ProjectMembership]] = relationship(
        "ProjectMembership", back_populates="project"
    )
    bookmarks: Mapped[list[ProjectBookmark]] = relationship(
        "ProjectBookmark", back_populates="project"
    )


class ProjectMembership(Base):
    __tablename__ = "project_memberships"
    __table_args__ = (UniqueConstraint("project_id", "user_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    project: Mapped[Project] = relationship("Project", back_populates="memberships")
    user: Mapped[User] = relationship("User", back_populates="project_memberships")


class ProjectBookmark(Base):
    __tablename__ = "project_bookmarks"
    __table_args__ = (UniqueConstraint("project_id", "user_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    project: Mapped[Project] = relationship("Project", back_populates="bookmarks")
    user: Mapped[User] = relationship("User", back_populates="project_bookmarks")


class Workshop(Base):
    __tablename__ = "workshops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    skill: Mapped[str] = mapped_column(String, nullable=False)
    cat: Mapped[str] = mapped_column(String, nullable=False)
    icon: Mapped[str] = mapped_column(String, nullable=False)
    host_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    when: Mapped[str] = mapped_column(String, nullable=False)
    place: Mapped[str] = mapped_column(String, nullable=False)
    seats: Mapped[int] = mapped_column(Integer, nullable=False)
    level: Mapped[str] = mapped_column(String, nullable=False)

    host: Mapped[User] = relationship("User", back_populates="workshops_hosted")
    memberships: Mapped[list[WorkshopMembership]] = relationship(
        "WorkshopMembership", back_populates="workshop"
    )


class WorkshopMembership(Base):
    __tablename__ = "workshop_memberships"
    __table_args__ = (UniqueConstraint("workshop_id", "user_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    workshop_id: Mapped[int] = mapped_column(Integer, ForeignKey("workshops.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    on_waitlist: Mapped[bool] = mapped_column(Boolean, default=False)

    workshop: Mapped[Workshop] = relationship("Workshop", back_populates="memberships")
    user: Mapped[User] = relationship("User", back_populates="workshop_memberships")


class SkillRequest(Base):
    __tablename__ = "skill_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    skill: Mapped[str] = mapped_column(String, nullable=False)
    count: Mapped[int] = mapped_column(Integer, default=0)


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(String, nullable=False)
    icon: Mapped[str] = mapped_column(String, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0)
```

---

## Step 2 — `backend/utils/karma.py`

Shared constants. Import from here, never redefine inline.

```python
KARMA_LEVELS = [
    (1, "Neighbor",    0,    149),
    (2, "Helper",      150,  399),
    (3, "Connector",   400,  749),
    (4, "Cornerstone", 750,  1499),
    (5, "Keystone",    1500, 2999),
    (6, "Pillar",      3000, None),
]

CAT_ICON: dict[str, str] = {
    "Garden":      "sprout",
    "Cleanup":     "trend",
    "Repair":      "wrench",
    "Skill-share": "bulb",
    "Mutual aid":  "heart",
}

def get_level_info(points: int) -> dict:
    for i, (level, name, min_pts, max_pts) in enumerate(KARMA_LEVELS):
        if max_pts is None or points <= max_pts:
            if max_pts is None:
                return {
                    "level": level, "level_name": name,
                    "next_level_name": None, "next_level_threshold": None,
                    "progress_pct": 100,
                }
            _, next_name, _, _ = KARMA_LEVELS[i + 1]
            progress = int((points - min_pts) / (max_pts + 1 - min_pts) * 100)
            return {
                "level": level, "level_name": name,
                "next_level_name": next_name,
                "next_level_threshold": max_pts + 1,
                "progress_pct": progress,
            }
    return {"level": 6, "level_name": "Pillar", "next_level_name": None,
            "next_level_threshold": None, "progress_pct": 100}
```

---

## Step 3 — `backend/schemas/projects.py`

```python
from pydantic import BaseModel, ConfigDict


class ProjectCreate(BaseModel):
    cat: str
    title: str
    desc: str | None = None
    when: str
    place: str
    cap: int
    karma: int
    dist: str = "0.0 mi"


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cat: str
    icon: str
    title: str
    desc: str | None
    place: str
    when: str
    karma: int
    host: str
    host_name: str
    dist: str
    joined: int
    cap: int
    pct: int
    bookmarked: bool
    is_mine: bool


class ProjectListOut(BaseModel):
    total: int
    items: list[ProjectOut]


class JoinProjectResponse(BaseModel):
    success: bool
    joined: int
    pct: int


class BookmarkResponse(BaseModel):
    bookmarked: bool
```

---

## Step 3 — `backend/schemas/workshops.py`

```python
from pydantic import BaseModel, ConfigDict


class WorkshopCreate(BaseModel):
    skill: str
    cat: str
    when: str
    place: str
    seats: int
    level: str


class WorkshopOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    skill: str
    cat: str
    icon: str
    host: str
    host_name: str
    when: str
    place: str
    seats: int
    taken: int
    seats_left: int
    level: str
    full: bool
    attending: bool
    is_mine: bool


class JoinWorkshopResponse(BaseModel):
    success: bool
    on_waitlist: bool
    seats_left: int
```

---

## Step 4 — `backend/seed.py`

Runs once on startup if the DB is empty. Seeds a demo user + all static content.

```python
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
    {"skill": "Furniture repair",    "count": 14},
    {"skill": "Canning & preserving","count": 11},
    {"skill": "Basic electrical",    "count": 9},
    {"skill": "Resume help",         "count": 7},
]

SEED_RESOURCES = [
    {"title": "Neighborhood event toolkit",  "description": "A step-by-step PDF for planning your first block event.", "source": "Strong Towns",                "icon": "flag",   "order": 1},
    {"title": "How to start a tool library", "description": "Local Tools' guide to sharing equipment with neighbors.", "source": "localtools.org",              "icon": "wrench", "order": 2},
    {"title": "Community garden starter",    "description": "Find a plot, organize volunteers, and split the harvest.","source": "American Community Garden Assn.","icon": "sprout","order": 3},
    {"title": "Mutual aid 101",              "description": "What it is, and how to set up a network on your street.", "source": "Mutual Aid Hub",              "icon": "heart",  "order": 4},
    {"title": "Run a repair café",           "description": "The official playbook for hosting fix-it events.",        "source": "Repair Café Intl.",           "icon": "bolt",   "order": 5},
    {"title": "Talking to new neighbors",    "description": "Low-pressure scripts for breaking the ice.",             "source": "Karma guide",                 "icon": "chat",   "order": 6},
]


async def seed(db: AsyncSession) -> None:
    result = await db.execute(select(User).limit(1))
    if result.scalar_one_or_none():
        return

    user = User(**DEMO_USER)
    db.add(user)
    await db.flush()

    for p in SEED_PROJECTS:
        project = Project(
            cat=p["cat"], icon=CAT_ICON[p["cat"]], title=p["title"],
            place=p["place"], when=p["when"], karma=p["karma"],
            dist=p["dist"], cap=p["cap"], host_id=user.id,
        )
        db.add(project)
        await db.flush()
        for _ in range(p["joined"]):
            db.add(ProjectMembership(project_id=project.id, user_id=user.id))

    for w in SEED_WORKSHOPS:
        workshop = Workshop(
            skill=w["skill"], cat=w["cat"], icon=CAT_ICON.get(w["cat"], "spark"),
            when=w["when"], place=w["place"], seats=w["seats"],
            level=w["level"], host_id=user.id,
        )
        db.add(workshop)
        await db.flush()
        for _ in range(w["taken"]):
            db.add(WorkshopMembership(workshop_id=workshop.id, user_id=user.id, on_waitlist=False))

    for sr in SEED_SKILL_REQUESTS:
        db.add(SkillRequest(**sr))

    for r in SEED_RESOURCES:
        db.add(Resource(**r))

    await db.commit()
```

---

## Step 5 — `backend/routers/projects.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models import Project, ProjectBookmark, ProjectMembership
from schemas.projects import (
    BookmarkResponse, JoinProjectResponse,
    ProjectCreate, ProjectListOut, ProjectOut,
)
from utils.karma import CAT_ICON

router = APIRouter(prefix="/api/projects", tags=["projects"])

# Replace with real auth dependency once auth is built
STUB_USER_ID = 1


def _build_project_out(project: Project, joined: int, bookmarked: bool, user_id: int) -> ProjectOut:
    pct = int(joined / project.cap * 100) if project.cap else 0
    return ProjectOut(
        id=project.id,
        cat=project.cat,
        icon=project.icon,
        title=project.title,
        desc=project.desc,
        place=project.place,
        when=project.when,
        karma=project.karma,
        host=project.host.initials,
        host_name=project.host.name,
        dist=project.dist,
        joined=joined,
        cap=project.cap,
        pct=pct,
        bookmarked=bookmarked,
        is_mine=project.host_id == user_id,
    )


@router.get("", response_model=ProjectListOut)
async def list_projects(
    cat: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> ProjectListOut:
    q = select(Project).options(selectinload(Project.host))
    if cat:
        q = q.where(Project.cat == cat)
    projects = (await db.execute(q)).scalars().all()

    items = []
    for p in projects:
        joined = await db.scalar(
            select(func.count()).where(ProjectMembership.project_id == p.id)
        ) or 0
        bookmarked = await db.scalar(
            select(func.count()).where(
                ProjectBookmark.project_id == p.id,
                ProjectBookmark.user_id == STUB_USER_ID,
            )
        ) or 0
        items.append(_build_project_out(p, joined, bool(bookmarked), STUB_USER_ID))

    return ProjectListOut(total=len(items), items=items)


@router.post("", response_model=ProjectOut, status_code=201)
async def create_project(
    body: ProjectCreate,
    db: AsyncSession = Depends(get_db),
) -> ProjectOut:
    project = Project(
        cat=body.cat,
        icon=CAT_ICON.get(body.cat, "sprout"),
        title=body.title,
        desc=body.desc,
        place=body.place,
        when=body.when,
        karma=body.karma,
        dist=body.dist,
        cap=body.cap,
        host_id=STUB_USER_ID,
    )
    db.add(project)
    await db.commit()
    result = await db.execute(
        select(Project).options(selectinload(Project.host)).where(Project.id == project.id)
    )
    project = result.scalar_one()
    return _build_project_out(project, 0, False, STUB_USER_ID)


@router.post("/{project_id}/join", response_model=JoinProjectResponse)
async def join_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
) -> JoinProjectResponse:
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        db.add(ProjectMembership(project_id=project_id, user_id=STUB_USER_ID))
        await db.commit()
    except IntegrityError:
        await db.rollback()

    joined = await db.scalar(
        select(func.count()).where(ProjectMembership.project_id == project_id)
    ) or 0
    pct = int(joined / project.cap * 100) if project.cap else 0
    return JoinProjectResponse(success=True, joined=joined, pct=pct)


@router.post("/{project_id}/bookmark", response_model=BookmarkResponse)
async def bookmark_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
) -> BookmarkResponse:
    if not await db.get(Project, project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    existing = await db.scalar(
        select(ProjectBookmark).where(
            ProjectBookmark.project_id == project_id,
            ProjectBookmark.user_id == STUB_USER_ID,
        )
    )
    if existing:
        await db.delete(existing)
        await db.commit()
        return BookmarkResponse(bookmarked=False)

    db.add(ProjectBookmark(project_id=project_id, user_id=STUB_USER_ID))
    await db.commit()
    return BookmarkResponse(bookmarked=True)
```

---

## Step 5 — `backend/routers/workshops.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models import Workshop, WorkshopMembership
from schemas.workshops import JoinWorkshopResponse, WorkshopCreate, WorkshopOut
from utils.karma import CAT_ICON

router = APIRouter(prefix="/api/workshops", tags=["workshops"])

STUB_USER_ID = 1


def _build_workshop_out(workshop: Workshop, taken: int, attending: bool, user_id: int) -> WorkshopOut:
    seats_left = max(0, workshop.seats - taken)
    return WorkshopOut(
        id=workshop.id,
        skill=workshop.skill,
        cat=workshop.cat,
        icon=workshop.icon,
        host=workshop.host.initials,
        host_name=workshop.host.name,
        when=workshop.when,
        place=workshop.place,
        seats=workshop.seats,
        taken=taken,
        seats_left=seats_left,
        level=workshop.level,
        full=seats_left == 0,
        attending=attending,
        is_mine=workshop.host_id == user_id,
    )


@router.get("", response_model=list[WorkshopOut])
async def list_workshops(
    tab: str = "upcoming",
    db: AsyncSession = Depends(get_db),
) -> list[WorkshopOut]:
    q = select(Workshop).options(selectinload(Workshop.host))

    if tab == "hosting":
        q = q.where(Workshop.host_id == STUB_USER_ID)
    elif tab == "attending":
        attending_ids = select(WorkshopMembership.workshop_id).where(
            WorkshopMembership.user_id == STUB_USER_ID,
            WorkshopMembership.on_waitlist.is_(False),
        )
        q = q.where(Workshop.id.in_(attending_ids))
    elif tab == "past":
        return []  # no datetime stored yet

    workshops = (await db.execute(q)).scalars().all()

    items = []
    for w in workshops:
        taken = await db.scalar(
            select(func.count()).where(
                WorkshopMembership.workshop_id == w.id,
                WorkshopMembership.on_waitlist.is_(False),
            )
        ) or 0
        attending = await db.scalar(
            select(func.count()).where(
                WorkshopMembership.workshop_id == w.id,
                WorkshopMembership.user_id == STUB_USER_ID,
            )
        ) or 0
        items.append(_build_workshop_out(w, taken, bool(attending), STUB_USER_ID))

    return items


@router.post("", response_model=WorkshopOut, status_code=201)
async def create_workshop(
    body: WorkshopCreate,
    db: AsyncSession = Depends(get_db),
) -> WorkshopOut:
    workshop = Workshop(
        skill=body.skill,
        cat=body.cat,
        icon=CAT_ICON.get(body.cat, "bulb"),
        when=body.when,
        place=body.place,
        seats=body.seats,
        level=body.level,
        host_id=STUB_USER_ID,
    )
    db.add(workshop)
    await db.commit()
    result = await db.execute(
        select(Workshop).options(selectinload(Workshop.host)).where(Workshop.id == workshop.id)
    )
    workshop = result.scalar_one()
    return _build_workshop_out(workshop, 0, False, STUB_USER_ID)


@router.post("/{workshop_id}/join", response_model=JoinWorkshopResponse)
async def join_workshop(
    workshop_id: int,
    db: AsyncSession = Depends(get_db),
) -> JoinWorkshopResponse:
    workshop = await db.get(Workshop, workshop_id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")

    taken = await db.scalar(
        select(func.count()).where(
            WorkshopMembership.workshop_id == workshop_id,
            WorkshopMembership.on_waitlist.is_(False),
        )
    ) or 0
    on_waitlist = taken >= workshop.seats

    try:
        db.add(WorkshopMembership(
            workshop_id=workshop_id,
            user_id=STUB_USER_ID,
            on_waitlist=on_waitlist,
        ))
        await db.commit()
    except IntegrityError:
        await db.rollback()

    seats_left = max(0, workshop.seats - taken)
    return JoinWorkshopResponse(success=True, on_waitlist=on_waitlist, seats_left=seats_left)
```

---

## Step 6 — `backend/main.py` additions

```python
from database import AsyncSessionLocal, Base, engine
from seed import seed
from routers import projects as projects_router
from routers import workshops as workshops_router

app.include_router(projects_router.router)
app.include_router(workshops_router.router)

@app.on_event("startup")
async def startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        await seed(db)
```

---

## Swapping in Real Auth Later

Every router has `STUB_USER_ID = 1` at the top. When auth is ready:

```python
# Remove this line:
STUB_USER_ID = 1

# Add this import:
from auth import get_current_user
from models import User

# Add to each endpoint signature:
current_user: User = Depends(get_current_user)

# Replace STUB_USER_ID with:
current_user.id
```
