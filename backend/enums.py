from enum import StrEnum


class Category(StrEnum):
    GARDEN = "Garden"
    CLEANUP = "Cleanup"
    REPAIR = "Repair"
    SKILL_SHARE = "Skill-share"
    MUTUAL_AID = "Mutual aid"


class WorkshopLevel(StrEnum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    ALL_LEVELS = "All levels"


class ProjectStatus(StrEnum):
    ACTIVE = "active"
    DRAFT = "draft"
