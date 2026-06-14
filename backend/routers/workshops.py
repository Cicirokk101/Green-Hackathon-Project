from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from enums import Category
from models import Workshop, WorkshopMembership
from schemas.workshops import (
    JoinStatusResponse,
    JoinWorkshopResponse,
    LeaveWorkshopResponse,
    WorkshopCreate,
    WorkshopOut,
    WorkshopUpdate,
)
from utils.karma import CAT_ICON

router = APIRouter(prefix="/api/workshops", tags=["workshops"])

STUB_USER_ID = 1


def _build_workshop_out(workshop: Workshop, taken: int, attending: bool, user_id: int) -> WorkshopOut:
    seats_left = max(0, workshop.seats - taken)
    return WorkshopOut(
        id=workshop.id,
        skill=workshop.skill,
        cat=workshop.cat,
        icon=CAT_ICON[Category(workshop.cat)],
        host_id=workshop.host_id,
        host_initials=workshop.host.initials,
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
        created_at=workshop.created_at,
    )


async def _get_taken(db: AsyncSession, workshop_id: int) -> int:
    return await db.scalar(
        select(func.count()).where(
            WorkshopMembership.workshop_id == workshop_id,
            WorkshopMembership.on_waitlist.is_(False),
        )
    ) or 0


async def _is_attending(db: AsyncSession, workshop_id: int, user_id: int) -> bool:
    count = await db.scalar(
        select(func.count()).where(
            WorkshopMembership.workshop_id == workshop_id,
            WorkshopMembership.user_id == user_id,
            WorkshopMembership.on_waitlist.is_(False),
        )
    ) or 0
    return bool(count)


@router.get("", response_model=list[WorkshopOut])
async def list_workshops(
    host_id: int | None = None,
    attendee_id: int | None = None,
    db: AsyncSession = Depends(get_db),
) -> list[WorkshopOut]:
    q = select(Workshop).options(selectinload(Workshop.host))

    if host_id is not None:
        q = q.where(Workshop.host_id == host_id)

    if attendee_id is not None:
        attending_ids = select(WorkshopMembership.workshop_id).where(
            WorkshopMembership.user_id == attendee_id,
            WorkshopMembership.on_waitlist.is_(False),
        )
        q = q.where(Workshop.id.in_(attending_ids))

    workshops = (await db.execute(q)).scalars().all()

    items = []
    for w in workshops:
        taken = await _get_taken(db, w.id)
        attending = await _is_attending(db, w.id, STUB_USER_ID)
        items.append(_build_workshop_out(w, taken, attending, STUB_USER_ID))

    return items


@router.post("", response_model=WorkshopOut, status_code=201)
async def create_workshop(
    body: WorkshopCreate,
    db: AsyncSession = Depends(get_db),
) -> WorkshopOut:
    workshop = Workshop(
        skill=body.skill,
        cat=body.cat,
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


@router.get("/{workshop_id}", response_model=WorkshopOut)
async def get_workshop(
    workshop_id: int,
    db: AsyncSession = Depends(get_db),
) -> WorkshopOut:
    result = await db.execute(
        select(Workshop).options(selectinload(Workshop.host)).where(Workshop.id == workshop_id)
    )
    workshop = result.scalar_one_or_none()
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")

    taken = await _get_taken(db, workshop_id)
    attending = await _is_attending(db, workshop_id, STUB_USER_ID)
    return _build_workshop_out(workshop, taken, attending, STUB_USER_ID)


@router.patch("/{workshop_id}", response_model=WorkshopOut)
async def update_workshop(
    workshop_id: int,
    body: WorkshopUpdate,
    db: AsyncSession = Depends(get_db),
) -> WorkshopOut:
    result = await db.execute(
        select(Workshop).options(selectinload(Workshop.host)).where(Workshop.id == workshop_id)
    )
    workshop = result.scalar_one_or_none()
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    if workshop.host_id != STUB_USER_ID:
        raise HTTPException(status_code=403, detail="Only the host can edit this workshop")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(workshop, field, value)

    await db.commit()
    await db.refresh(workshop)

    taken = await _get_taken(db, workshop_id)
    attending = await _is_attending(db, workshop_id, STUB_USER_ID)
    return _build_workshop_out(workshop, taken, attending, STUB_USER_ID)


@router.delete("/{workshop_id}", status_code=204)
async def delete_workshop(
    workshop_id: int,
    db: AsyncSession = Depends(get_db),
) -> Response:
    workshop = await db.get(Workshop, workshop_id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    if workshop.host_id != STUB_USER_ID:
        raise HTTPException(status_code=403, detail="Only the host can delete this workshop")

    await db.execute(delete(WorkshopMembership).where(WorkshopMembership.workshop_id == workshop_id))
    await db.delete(workshop)
    await db.commit()
    return Response(status_code=204)


@router.post("/{workshop_id}/join", response_model=JoinWorkshopResponse)
async def join_workshop(
    workshop_id: int,
    db: AsyncSession = Depends(get_db),
) -> JoinWorkshopResponse:
    workshop = await db.get(Workshop, workshop_id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")

    seats = workshop.seats
    taken = await _get_taken(db, workshop_id)
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


@router.delete("/{workshop_id}/join", response_model=LeaveWorkshopResponse)
async def leave_workshop(
    workshop_id: int,
    db: AsyncSession = Depends(get_db),
) -> LeaveWorkshopResponse:
    workshop = await db.get(Workshop, workshop_id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")

    await db.execute(
        delete(WorkshopMembership).where(
            WorkshopMembership.workshop_id == workshop_id,
            WorkshopMembership.user_id == STUB_USER_ID,
        )
    )
    await db.commit()

    taken = await _get_taken(db, workshop_id)
    return LeaveWorkshopResponse(success=True, seats_left=max(0, workshop.seats - taken))


@router.get("/{workshop_id}/join/{user_id}", response_model=JoinStatusResponse)
async def join_status(
    workshop_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
) -> JoinStatusResponse:
    workshop = await db.get(Workshop, workshop_id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")

    membership = await db.scalar(
        select(WorkshopMembership).where(
            WorkshopMembership.workshop_id == workshop_id,
            WorkshopMembership.user_id == user_id,
        )
    )
    if not membership:
        return JoinStatusResponse(joined=False, on_waitlist=False)
    return JoinStatusResponse(joined=True, on_waitlist=membership.on_waitlist)
