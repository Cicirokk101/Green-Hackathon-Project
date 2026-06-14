from datetime import datetime

from pydantic import BaseModel, ConfigDict

from enums import Category


class ProjectCreate(BaseModel):
    cat: Category
    title: str
    desc: str | None = None
    when: datetime
    place: str
    cap: int
    karma: int


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cat: Category
    icon: str
    title: str
    desc: str | None
    place: str
    when: datetime
    karma: int
    host_id: int
    host_initials: str
    host_name: str
    joined: int
    cap: int
    pct: int
    bookmarked: bool
    is_mine: bool
    joined_by_me: bool
    created_at: datetime


class ProjectListOut(BaseModel):
    total: int
    items: list[ProjectOut]


class JoinProjectResponse(BaseModel):
    success: bool
    joined: int
    pct: int


class LeaveProjectResponse(BaseModel):
    success: bool
    joined: int
    pct: int


class BookmarkResponse(BaseModel):
    bookmarked: bool
