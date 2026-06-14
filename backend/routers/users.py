from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User
from schemas.users import UserOut, UserUpdate

router = APIRouter(prefix="/api/users", tags=["users"])

STUB_USER_ID = 1


@router.get("/me", response_model=UserOut)
async def get_me(db: AsyncSession = Depends(get_db)) -> UserOut:
    user = await db.get(User, STUB_USER_ID)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut.model_validate(user)


@router.patch("/me", response_model=UserOut)
async def update_me(
    body: UserUpdate,
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    user = await db.get(User, STUB_USER_ID)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.skills is not None:
        user.skills = body.skills

    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)
