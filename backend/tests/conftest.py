import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app
from models import User

DATABASE_URL = "sqlite+aiosqlite:///:memory:"

PROJECT_PAYLOAD: dict = {
    "cat": "Garden",
    "title": "Build a community garden",
    "desc": "Help us dig and plant!",
    "when": "Saturday 10am",
    "place": "Elm St.",
    "cap": 10,
    "karma": 40,
}

WORKSHOP_PAYLOAD: dict = {
    "skill": "Sourdough basics",
    "cat": "Skill-share",
    "when": "Sunday 2pm",
    "place": "Community Center",
    "seats": 8,
    "level": "Beginner",
}


@pytest.fixture
async def client():
    eng = create_async_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    factory = sessionmaker(eng, class_=AsyncSession, expire_on_commit=False)

    # Seed STUB_USER_ID=1, required by all endpoint handlers
    async with factory() as session:
        session.add(User(
            name="Test User",
            initials="TU",
            email="test@example.com",
            password_hash="hashed",
            karma_points=100,
            level=1,
        ))
        await session.commit()

    async def _get_db():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = _get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await eng.dispose()
