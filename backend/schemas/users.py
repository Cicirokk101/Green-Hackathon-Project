from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    handle: str | None
    initials: str
    location: str | None
    bio: str | None
    helping_status: str | None
    skills: Any
    interests: Any
    badges: Any
    karma_points: int
    level: int
    onboarding_complete: bool
    created_at: datetime


class UserUpdate(BaseModel):
    name: str | None = None
    handle: str | None = None
    location: str | None = None
    bio: str | None = None
    helping_status: str | None = None
    skills: list | None = None


class UserStatsOut(BaseModel):
    projects_joined_count: int
    projects_created_count: int
    workshops_hosting_count: int
    workshops_attending_count: int
    neighbors_helped_count: int
    badges_count: int
