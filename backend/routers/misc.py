from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Resource, SkillRequest

router = APIRouter(tags=["misc"])


class SkillRequestOut(BaseModel):
    skill: str
    count: int


class ResourceOut(BaseModel):
    id: int
    title: str
    description: str
    source: str
    icon: str
    order: int


@router.get("/api/skills/requested", response_model=list[SkillRequestOut])
async def list_skill_requests(db: AsyncSession = Depends(get_db)) -> list[SkillRequestOut]:
    rows = (await db.execute(
        select(SkillRequest).order_by(SkillRequest.count.desc())
    )).scalars().all()
    return [SkillRequestOut(skill=r.skill, count=r.count) for r in rows]


@router.get("/api/resources", response_model=list[ResourceOut])
async def list_resources(db: AsyncSession = Depends(get_db)) -> list[ResourceOut]:
    rows = (await db.execute(
        select(Resource).order_by(Resource.order)
    )).scalars().all()
    return [ResourceOut(id=r.id, title=r.title, description=r.description, source=r.source, icon=r.icon, order=r.order) for r in rows]
