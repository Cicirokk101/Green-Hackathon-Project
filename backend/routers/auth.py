from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import create_token, get_current_user, hash_password, verify_password
from database import get_db
from models import User
from schemas.auth import LoginIn, RegisterIn, TokenOut
from schemas.users import UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut, status_code=201)
async def register(body: RegisterIn, db: AsyncSession = Depends(get_db)) -> TokenOut:
    existing = await db.scalar(select(User).where(User.email == body.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    initials = "".join(w[0].upper() for w in body.name.split()[:2]) or "?"
    user = User(
        name=body.name,
        initials=initials,
        email=body.email,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return TokenOut(token=create_token(user.id), user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenOut)
async def login(body: LoginIn, db: AsyncSession = Depends(get_db)) -> TokenOut:
    user = await db.scalar(select(User).where(User.email == body.email))
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenOut(token=create_token(user.id), user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(user)
