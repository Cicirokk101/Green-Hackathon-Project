from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()
    initials: Mapped[str] = mapped_column(String(10))
    email: Mapped[str] = mapped_column(unique=True)
    password_hash: Mapped[str] = mapped_column()
    karma_points: Mapped[int] = mapped_column(default=0)
    skills: Mapped[Any] = mapped_column(JSON, default=list)
    interests: Mapped[Any] = mapped_column(JSON, default=list)
    onboarding_complete: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    @property
    def level(self) -> int:
        from utils.karma import get_level_info
        return get_level_info(self.karma_points)["level"]

    projects_hosted: Mapped[list[Project]] = relationship(
        "Project", back_populates="host", foreign_keys="Project.host_id"
    )
    project_memberships: Mapped[list[ProjectMembership]] = relationship(
        "ProjectMembership", back_populates="user"
    )
    project_bookmarks: Mapped[list[ProjectBookmark]] = relationship(
        "ProjectBookmark", back_populates="user"
    )
    workshops_hosted: Mapped[list[Workshop]] = relationship(
        "Workshop", back_populates="host"
    )
    workshop_memberships: Mapped[list[WorkshopMembership]] = relationship(
        "WorkshopMembership", back_populates="user"
    )


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    cat: Mapped[str] = mapped_column()
    title: Mapped[str] = mapped_column()
    desc: Mapped[str | None] = mapped_column(Text)
    place: Mapped[str] = mapped_column()
    when: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    karma: Mapped[int] = mapped_column()
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    cap: Mapped[int] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    host: Mapped[User] = relationship(
        "User", back_populates="projects_hosted", foreign_keys=[host_id]
    )
    memberships: Mapped[list[ProjectMembership]] = relationship(
        "ProjectMembership", back_populates="project"
    )
    bookmarks: Mapped[list[ProjectBookmark]] = relationship(
        "ProjectBookmark", back_populates="project"
    )


class ProjectMembership(Base):
    __tablename__ = "project_memberships"
    __table_args__ = (UniqueConstraint("project_id", "user_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    project: Mapped[Project] = relationship("Project", back_populates="memberships")
    user: Mapped[User] = relationship("User", back_populates="project_memberships")


class ProjectBookmark(Base):
    __tablename__ = "project_bookmarks"
    __table_args__ = (UniqueConstraint("project_id", "user_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    project: Mapped[Project] = relationship("Project", back_populates="bookmarks")
    user: Mapped[User] = relationship("User", back_populates="project_bookmarks")


class Workshop(Base):
    __tablename__ = "workshops"

    id: Mapped[int] = mapped_column(primary_key=True)
    skill: Mapped[str] = mapped_column()
    cat: Mapped[str] = mapped_column()
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    when: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    place: Mapped[str] = mapped_column()
    seats: Mapped[int] = mapped_column()
    level: Mapped[str] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    host: Mapped[User] = relationship("User", back_populates="workshops_hosted")
    memberships: Mapped[list[WorkshopMembership]] = relationship(
        "WorkshopMembership", back_populates="workshop"
    )


class WorkshopMembership(Base):
    __tablename__ = "workshop_memberships"
    __table_args__ = (UniqueConstraint("workshop_id", "user_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    workshop_id: Mapped[int] = mapped_column(ForeignKey("workshops.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    on_waitlist: Mapped[bool] = mapped_column(default=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    workshop: Mapped[Workshop] = relationship("Workshop", back_populates="memberships")
    user: Mapped[User] = relationship("User", back_populates="workshop_memberships")


class SkillRequest(Base):
    __tablename__ = "skill_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    skill: Mapped[str] = mapped_column()
    count: Mapped[int] = mapped_column(default=0)


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column()
    icon: Mapped[str] = mapped_column()
    order: Mapped[int] = mapped_column(default=0)
