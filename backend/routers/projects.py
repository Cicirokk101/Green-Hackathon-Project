from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from enums import Category
from models import Project, ProjectBookmark, ProjectMembership
from schemas.projects import (
    BookmarkResponse, JoinProjectResponse,
    ProjectCreate, ProjectListOut, ProjectOut,
)
from utils.karma import CAT_ICON

router = APIRouter(prefix="/api/projects", tags=["projects"])

STUB_USER_ID = 1


def _build_project_out(project: Project, joined: int, bookmarked: bool, user_id: int) -> ProjectOut:
    pct = int(joined / project.cap * 100) if project.cap else 0
    return ProjectOut(
        id=project.id,
        cat=project.cat,
        icon=CAT_ICON[Category(project.cat)],
        title=project.title,
        desc=project.desc,
        place=project.place,
        when=project.when,
        karma=project.karma,
        host_id=project.host_id,
        host_initials=project.host.initials,
        host_name=project.host.name,
        joined=joined,
        cap=project.cap,
        pct=pct,
        bookmarked=bookmarked,
        is_mine=project.host_id == user_id,
        created_at=project.created_at,
    )


@router.get("", response_model=ProjectListOut)
async def list_projects(
    cat: Category | None = None,
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
        title=body.title,
        desc=body.desc,
        place=body.place,
        when=body.when,
        karma=body.karma,
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

    cap = project.cap

    try:
        db.add(ProjectMembership(project_id=project_id, user_id=STUB_USER_ID))
        await db.commit()
    except IntegrityError:
        await db.rollback()

    joined = await db.scalar(
        select(func.count()).where(ProjectMembership.project_id == project_id)
    ) or 0
    pct = int(joined / cap * 100) if cap else 0
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
