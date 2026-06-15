from datetime import datetime, timedelta, timezone

import bcrypt as _bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models import User

_bearer = HTTPBearer()
_optional_bearer = HTTPBearer(auto_error=False)

_ALGORITHM = "HS256"
_EXPIRY_DAYS = 7


def hash_password(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode(), _bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(user_id: int) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=_EXPIRY_DAYS)
    return jwt.encode({"user_id": user_id, "exp": exp}, settings.secret_key, algorithm=_ALGORITHM)


def decode_token(token: str) -> dict:  # type: ignore[type-arg]
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_token(credentials.credentials)
    user = await db.get(User, payload["user_id"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_optional_bearer),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        return await db.get(User, payload["user_id"])
    except HTTPException:
        return None
