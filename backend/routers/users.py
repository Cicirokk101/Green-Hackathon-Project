from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models import Project, ProjectMembership, User, Workshop, WorkshopMembership
from schemas.users import UserOut, UserStatsOut, UserUpdate

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(user)


@router.patch("/me", response_model=UserOut)
async def update_me(
    body: UserUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> UserOut:
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut.model_validate(user)


@router.put("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    body: UserUpdate,
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.get("/{user_id}/stats", response_model=UserStatsOut)
async def get_user_stats(
    user_id: int,
    db: AsyncSession = Depends(get_db),
) -> UserStatsOut:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    projects_joined = await db.scalar(
        select(func.count()).where(ProjectMembership.user_id == user_id)
    ) or 0

    projects_created = await db.scalar(
        select(func.count()).where(Project.host_id == user_id)
    ) or 0

    workshops_hosting = await db.scalar(
        select(func.count()).where(Workshop.host_id == user_id)
    ) or 0

    workshops_attending = await db.scalar(
        select(func.count()).where(
            WorkshopMembership.user_id == user_id,
            WorkshopMembership.on_waitlist.is_(False),
        )
    ) or 0

    hosted_project_ids = select(Project.id).where(Project.host_id == user_id)
    neighbors_helped = await db.scalar(
        select(func.count(ProjectMembership.user_id.distinct())).where(
            ProjectMembership.project_id.in_(hosted_project_ids),
            ProjectMembership.user_id != user_id,
        )
    ) or 0

    return UserStatsOut(
        projects_joined_count=projects_joined,
        projects_created_count=projects_created,
        workshops_hosting_count=workshops_hosting,
        workshops_attending_count=workshops_attending,
        neighbors_helped_count=neighbors_helped,
        badges_count=len(user.badges or []),
    )
