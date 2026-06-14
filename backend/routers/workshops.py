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
        return []

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

    seats = workshop.seats  # read before commit/rollback expires the object

    taken = await db.scalar(
        select(func.count()).where(
            WorkshopMembership.workshop_id == workshop_id,
            WorkshopMembership.on_waitlist.is_(False),
        )
    ) or 0
    on_waitlist = taken >= seats

    try:
        db.add(WorkshopMembership(
            workshop_id=workshop_id,
            user_id=STUB_USER_ID,
            on_waitlist=on_waitlist,
        ))
        await db.commit()
    except IntegrityError:
        await db.rollback()

    seats_left = max(0, seats - taken)
    return JoinWorkshopResponse(success=True, on_waitlist=on_waitlist, seats_left=seats_left)
