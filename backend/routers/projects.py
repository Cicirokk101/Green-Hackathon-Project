from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth import get_current_user, get_optional_user
from database import get_db
from enums import Category, ProjectStatus
from models import Project, ProjectBookmark, ProjectMembership, User
from schemas.projects import (
    BookmarkResponse, JoinProjectResponse,
    ProjectCreate, ProjectListOut, ProjectOut,
)
from utils.karma import CAT_ICON

router = APIRouter(prefix="/api/projects", tags=["projects"])


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
        status=project.status,
        created_at=project.created_at,
    )


@router.get("", response_model=ProjectListOut)
async def list_projects(
    cat: Category | None = None,
    host_id: int | None = None,
    joined_by: int | None = None,
    status: ProjectStatus | None = None,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> ProjectListOut:
    q = select(Project).options(selectinload(Project.host))
    if cat:
        q = q.where(Project.cat == cat)
    if host_id is not None:
        q = q.where(Project.host_id == host_id)
    if status is not None:
        q = q.where(Project.status == status)
    if joined_by is not None:
        joined_ids = select(ProjectMembership.project_id).where(
            ProjectMembership.user_id == joined_by
        )
        q = q.where(Project.id.in_(joined_ids))
    projects = (await db.execute(q)).scalars().all()

    items = []
    for p in projects:
        joined = await db.scalar(
            select(func.count()).where(ProjectMembership.project_id == p.id)
        ) or 0
        bookmarked = False
        if user:
            bookmarked = bool(await db.scalar(
                select(func.count()).where(
                    ProjectBookmark.project_id == p.id,
                    ProjectBookmark.user_id == user.id,
                )
            ) or 0)
        items.append(_build_project_out(p, joined, bookmarked, user.id if user else -1))

    return ProjectListOut(total=len(items), items=items)


@router.post("", response_model=ProjectOut, status_code=201)
async def create_project(
    body: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ProjectOut:
    project = Project(
        cat=body.cat,
        title=body.title,
        desc=body.desc,
        place=body.place,
        when=body.when,
        karma=body.karma,
        cap=body.cap,
        status=body.status,
        host_id=user.id,
    )
    db.add(project)
    await db.commit()
    result = await db.execute(
        select(Project).options(selectinload(Project.host)).where(Project.id == project.id)
    )
    project = result.scalar_one()
    return _build_project_out(project, 0, False, user.id)


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Response:
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.host_id != user.id:
        raise HTTPException(status_code=403, detail="Only the host can delete this project")

    await db.execute(delete(ProjectMembership).where(ProjectMembership.project_id == project_id))
    await db.execute(delete(ProjectBookmark).where(ProjectBookmark.project_id == project_id))
    await db.delete(project)
    await db.commit()
    return Response(status_code=204)


@router.post("/{project_id}/join", response_model=JoinProjectResponse)
async def join_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> JoinProjectResponse:
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    cap = project.cap

    try:
        db.add(ProjectMembership(project_id=project_id, user_id=user.id))
        await db.commit()
    except IntegrityError:
        await db.rollback()

    joined = await db.scalar(
        select(func.count()).where(ProjectMembership.project_id == project_id)
    ) or 0
    pct = int(joined / cap * 100) if cap else 0
    return JoinProjectResponse(success=True, joined=joined, pct=pct)


@router.delete("/{project_id}/join", response_model=JoinProjectResponse)
async def leave_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> JoinProjectResponse:
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    await db.execute(
        delete(ProjectMembership).where(
            ProjectMembership.project_id == project_id,
            ProjectMembership.user_id == user.id,
        )
    )
    await db.commit()

    joined = await db.scalar(
        select(func.count()).where(ProjectMembership.project_id == project_id)
    ) or 0
    pct = int(joined / project.cap * 100) if project.cap else 0
    return JoinProjectResponse(success=True, joined=joined, pct=pct)


@router.post("/{project_id}/bookmark", response_model=BookmarkResponse)
async def bookmark_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> BookmarkResponse:
    if not await db.get(Project, project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    existing = await db.scalar(
        select(ProjectBookmark).where(
            ProjectBookmark.project_id == project_id,
            ProjectBookmark.user_id == user.id,
        )
    )
    if existing:
        await db.delete(existing)
        await db.commit()
        return BookmarkResponse(bookmarked=False)

    db.add(ProjectBookmark(project_id=project_id, user_id=user.id))
    await db.commit()
    return BookmarkResponse(bookmarked=True)
