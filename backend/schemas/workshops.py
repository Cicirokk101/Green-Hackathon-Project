from pydantic import BaseModel, ConfigDict


class WorkshopCreate(BaseModel):
    skill: str
    cat: str
    when: str
    place: str
    seats: int
    level: str


class WorkshopOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    skill: str
    cat: str
    icon: str
    host: str
    host_name: str
    when: str
    place: str
    seats: int
    taken: int
    seats_left: int
    level: str
    full: bool
    attending: bool
    is_mine: bool


class JoinWorkshopResponse(BaseModel):
    success: bool
    on_waitlist: bool
    seats_left: int
