from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    initials: str
    karma_points: int
    skills: list[str]
    interests: list[str]
    level: int


class UserUpdate(BaseModel):
    skills: list[str] | None = None
