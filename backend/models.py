from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    initials: Mapped[str] = mapped_column(String(10), nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    karma_points: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)
    skills: Mapped[str] = mapped_column(Text, default="[]")
    interests: Mapped[str] = mapped_column(Text, default="[]")
    onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False)

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

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cat: Mapped[str] = mapped_column(String, nullable=False)
    icon: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    desc: Mapped[str | None] = mapped_column(Text, nullable=True)
    place: Mapped[str] = mapped_column(String, nullable=False)
    when: Mapped[str] = mapped_column(String, nullable=False)
    karma: Mapped[int] = mapped_column(Integer, nullable=False)
    host_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    dist: Mapped[str] = mapped_column(String, default="0.0 mi")
    cap: Mapped[int] = mapped_column(Integer, nullable=False)

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

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    project: Mapped[Project] = relationship("Project", back_populates="memberships")
    user: Mapped[User] = relationship("User", back_populates="project_memberships")


class ProjectBookmark(Base):
    __tablename__ = "project_bookmarks"
    __table_args__ = (UniqueConstraint("project_id", "user_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    project: Mapped[Project] = relationship("Project", back_populates="bookmarks")
    user: Mapped[User] = relationship("User", back_populates="project_bookmarks")


class Workshop(Base):
    __tablename__ = "workshops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    skill: Mapped[str] = mapped_column(String, nullable=False)
    cat: Mapped[str] = mapped_column(String, nullable=False)
    icon: Mapped[str] = mapped_column(String, nullable=False)
    host_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    when: Mapped[str] = mapped_column(String, nullable=False)
    place: Mapped[str] = mapped_column(String, nullable=False)
    seats: Mapped[int] = mapped_column(Integer, nullable=False)
    level: Mapped[str] = mapped_column(String, nullable=False)

    host: Mapped[User] = relationship("User", back_populates="workshops_hosted")
    memberships: Mapped[list[WorkshopMembership]] = relationship(
        "WorkshopMembership", back_populates="workshop"
    )


class WorkshopMembership(Base):
    __tablename__ = "workshop_memberships"
    __table_args__ = (UniqueConstraint("workshop_id", "user_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    workshop_id: Mapped[int] = mapped_column(Integer, ForeignKey("workshops.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    on_waitlist: Mapped[bool] = mapped_column(Boolean, default=False)

    workshop: Mapped[Workshop] = relationship("Workshop", back_populates="memberships")
    user: Mapped[User] = relationship("User", back_populates="workshop_memberships")


class SkillRequest(Base):
    __tablename__ = "skill_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    skill: Mapped[str] = mapped_column(String, nullable=False)
    count: Mapped[int] = mapped_column(Integer, default=0)


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(String, nullable=False)
    icon: Mapped[str] = mapped_column(String, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0)
