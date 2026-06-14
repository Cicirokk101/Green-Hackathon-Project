from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Resource, SkillRequest

router = APIRouter(tags=["misc"])


class SkillRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    skill: str
    count: int


class ResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
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
    return [SkillRequestOut.model_validate(r) for r in rows]


@router.get("/api/resources", response_model=list[ResourceOut])
async def list_resources(db: AsyncSession = Depends(get_db)) -> list[ResourceOut]:
    rows = (await db.execute(
        select(Resource).order_by(Resource.order)
    )).scalars().all()
    return [ResourceOut.model_validate(r) for r in rows]
