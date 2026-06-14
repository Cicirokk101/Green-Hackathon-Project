from datetime import datetime

from pydantic import BaseModel, ConfigDict

from enums import Category, WorkshopLevel


class WorkshopCreate(BaseModel):
    skill: str
    cat: Category
    when: datetime
    place: str
    seats: int
    level: WorkshopLevel


class WorkshopUpdate(BaseModel):
    skill: str | None = None
    cat: Category | None = None
    when: datetime | None = None
    place: str | None = None
    seats: int | None = None
    level: WorkshopLevel | None = None


class WorkshopOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    skill: str
    cat: Category
    icon: str
    host_id: int
    host_initials: str
    host_name: str
    when: datetime
    place: str
    seats: int
    taken: int
    seats_left: int
    level: WorkshopLevel
    full: bool
    attending: bool
    is_mine: bool
    created_at: datetime


class JoinWorkshopResponse(BaseModel):
    success: bool
    on_waitlist: bool
    seats_left: int


class LeaveWorkshopResponse(BaseModel):
    success: bool
    seats_left: int


class JoinStatusResponse(BaseModel):
    joined: bool
    on_waitlist: bool
