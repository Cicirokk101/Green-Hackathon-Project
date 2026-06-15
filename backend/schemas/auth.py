from pydantic import BaseModel

from schemas.users import UserOut


class RegisterIn(BaseModel):
    name: str
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


class TokenOut(BaseModel):
    token: str
    user: UserOut
