from enums import Category

KARMA_LEVELS = [
    (1, "Neighbor",    0,    149),
    (2, "Helper",      150,  399),
    (3, "Connector",   400,  749),
    (4, "Cornerstone", 750,  1499),
    (5, "Keystone",    1500, 2999),
    (6, "Pillar",      3000, None),
]

CAT_ICON: dict[Category, str] = {
    Category.GARDEN:     "sprout",
    Category.CLEANUP:    "trend",
    Category.REPAIR:     "wrench",
    Category.SKILL_SHARE: "bulb",
    Category.MUTUAL_AID: "heart",
}


def get_level_info(points: int) -> dict:
    for i, (level, name, min_pts, max_pts) in enumerate(KARMA_LEVELS):
        if max_pts is None or points <= max_pts:
            if max_pts is None:
                return {
                    "level": level, "level_name": name,
                    "next_level_name": None, "next_level_threshold": None,
                    "progress_pct": 100,
                }
            _, next_name, _, _ = KARMA_LEVELS[i + 1]
            progress = int((points - min_pts) / (max_pts + 1 - min_pts) * 100)
            return {
                "level": level, "level_name": name,
                "next_level_name": next_name,
                "next_level_threshold": max_pts + 1,
                "progress_pct": progress,
            }
    return {"level": 6, "level_name": "Pillar", "next_level_name": None,
            "next_level_threshold": None, "progress_pct": 100}
