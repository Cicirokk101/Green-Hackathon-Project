from pydantic import BaseModel, ConfigDict


class ProjectCreate(BaseModel):
    cat: str
    title: str
    desc: str | None = None
    when: str
    place: str
    cap: int
    karma: int


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cat: str
    icon: str
    title: str
    desc: str | None
    place: str
    when: str
    karma: int
    host: str
    host_name: str
    dist: str
    joined: int
    cap: int
    pct: int
    bookmarked: bool
    is_mine: bool


class ProjectListOut(BaseModel):
    total: int
    items: list[ProjectOut]


class JoinProjectResponse(BaseModel):
    success: bool
    joined: int
    pct: int


class BookmarkResponse(BaseModel):
    bookmarked: bool
