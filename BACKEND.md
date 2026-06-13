# Backend Plan

## Overview

Full-stack plan derived from the static frontend, extended with auth and onboarding.
JWT-based auth (token stored in localStorage). SQLite for local dev, Postgres for prod.
All endpoints except `/api/auth/*` require a valid token.

---

## Auth Flow

```
New user:
  POST /api/auth/signup → JWT token
  → frontend stores token
  → GET /api/auth/me returns { onboarding_complete: false }
  → frontend shows OnboardingModal (multi-step)
  → user picks interests + skills → POST /api/auth/onboarding
  → modal closes, app loads normally

Returning user:
  POST /api/auth/login → JWT token
  → frontend stores token
  → GET /api/auth/me returns { onboarding_complete: true }
  → app loads normally
```

---

## Endpoints

### Auth

#### `POST /api/auth/signup`
Create a new account.

**Request body**
```json
{ "name": "Morgan R.", "email": "morgan@example.com", "password": "..." }
```

**Response** `201`
```json
{
  "token": "eyJ...",
  "user": {
    "id": 1,
    "name": "Morgan R.",
    "initials": "MR",
    "karma_points": 0,
    "onboarding_complete": false
  }
}
```

---

#### `POST /api/auth/login`

**Request body**
```json
{ "email": "morgan@example.com", "password": "..." }
```

**Response** `200` — same shape as signup
**Error** `401` on bad credentials

---

#### `GET /api/auth/me`
Validates token and returns the current user. Called on every app load to check session + onboarding state.

**Response** `200`
```json
{
  "id": 1,
  "name": "Morgan R.",
  "initials": "MR",
  "karma_points": 0,
  "level": 1,
  "level_name": "Neighbor",
  "onboarding_complete": false,
  "interests": [],
  "skills": []
}
```
**Error** `401` if token missing or expired

---

#### `POST /api/auth/onboarding`
Called once after signup to save the user's interests and skills. Sets `onboarding_complete = true`.

**Request body**
```json
{
  "interests": ["Garden", "Skill-share", "Mutual aid"],
  "skills": ["Carpentry", "Gardening"]
}
```

**Response** `200`
```json
{ "onboarding_complete": true, "interests": ["Garden", "Skill-share"], "skills": ["Carpentry"] }
```

---

### Projects

#### `GET /api/projects`
List projects. Optional category filter. Results are personalized — user's interests are used to sort/highlight if no filter set.

**Query params**
- `cat` (optional) — `Garden | Cleanup | Repair | Skill-share | Mutual aid`

**Response** `200`
```json
{
  "total": 5,
  "items": [
    {
      "id": 1,
      "cat": "Garden",
      "icon": "sprout",
      "title": "Build raised beds at the Elm St. lot",
      "desc": "Come help us build four raised garden beds.",
      "place": "Riverside lot",
      "when": "Sat 9am",
      "karma": 40,
      "host": "DA",
      "host_name": "Dana A.",
      "dist": "0.3 mi",
      "joined": 6,
      "cap": 10,
      "pct": 60,
      "bookmarked": false,
      "is_mine": false
    }
  ]
}
```

---

#### `POST /api/projects`
Create a new project. `host` and `host_name` are set from the auth token.

**Request body**
```json
{
  "cat": "Garden",
  "title": "Build raised beds at the Elm St. lot",
  "desc": "Come help us build four raised garden beds.",
  "when": "Sat 9am",
  "place": "Riverside lot",
  "cap": 8,
  "karma": 25
}
```

**Response** `201` — created project object

---

#### `POST /api/projects/{id}/join`
Join a project. Idempotent.

**Response** `200`
```json
{ "success": true, "joined": 7, "pct": 70 }
```

---

#### `POST /api/projects/{id}/bookmark`
Toggle bookmark. Call again to unbookmark.

**Response** `200`
```json
{ "bookmarked": true }
```

---

### Workshops

#### `GET /api/workshops`
**Query params**
- `tab` (optional, default `upcoming`) — `upcoming | hosting | attending | past`

`hosting` and `attending` tabs are filtered to the current user.

**Response** `200`
```json
[
  {
    "id": 1,
    "skill": "Sourdough basics",
    "cat": "Skill-share",
    "icon": "spark",
    "host": "RW",
    "host_name": "Rosa W.",
    "when": "Thu · Jun 19 · 6pm",
    "place": "Maple Kitchen Co-op",
    "seats": 8,
    "taken": 5,
    "seats_left": 3,
    "level": "Beginner",
    "full": false,
    "attending": false,
    "is_mine": false
  }
]
```

---

#### `POST /api/workshops`
Host a new workshop. `host` fields set from auth token.

**Request body**
```json
{
  "skill": "Intro to canning",
  "cat": "Skill-share",
  "when": "Sat · Jul 5 · 2pm",
  "place": "Maple Kitchen Co-op",
  "seats": 8,
  "level": "Beginner"
}
```

**Response** `201` — created workshop object

---

#### `POST /api/workshops/{id}/join`
Reserve seat or join waitlist if full.

**Response** `200`
```json
{ "success": true, "on_waitlist": false, "seats_left": 2 }
```

---

### Profile

#### `GET /api/profile`
Full profile for the current user. Used by the Profile page.

**Response** `200`
```json
{
  "id": 1,
  "name": "Morgan R.",
  "initials": "MR",
  "email": "morgan@example.com",
  "karma_points": 1240,
  "level": 4,
  "level_name": "Cornerstone",
  "next_level_name": "Keystone",
  "next_level_threshold": 1500,
  "progress_pct": 64,
  "skills": ["Carpentry", "Gardening", "First aid"],
  "interests": ["Garden", "Repair"],
  "projects_hosted": 2,
  "projects_joined": 7,
  "workshops_hosted": 1,
  "workshops_attended": 3
}
```

---

#### `POST /api/profile/skills`
Add a skill.

**Request body** `{ "skill": "Welding" }`

**Response** `200` `{ "skills": ["Carpentry", "Gardening", "First aid", "Welding"] }`

---

#### `DELETE /api/profile/skills/{skill}`
Remove a skill.

**Response** `200` `{ "skills": ["Carpentry", "Gardening"] }`

---

### Community Sidebar

#### `GET /api/skills/requested`
Most-requested skills. Seeded, read-only for now.

**Response** `200`
```json
[
  { "skill": "Furniture repair", "count": 14 },
  { "skill": "Canning & preserving", "count": 11 },
  { "skill": "Basic electrical", "count": 9 },
  { "skill": "Resume help", "count": 7 }
]
```

---

### Resources

#### `GET /api/resources`
Curated links. Seed data, no writes.

**Response** `200`
```json
[
  {
    "id": 1,
    "title": "Neighborhood event toolkit",
    "description": "A step-by-step PDF for planning your first block event.",
    "source": "Strong Towns",
    "icon": "flag"
  }
]
```

---

## Onboarding Modal (Frontend)

Multi-step modal shown immediately after signup, before the user sees the app.
Blocks the UI until completed (no skip).

### Step 1 — Welcome
- App name, tagline, one-sentence explanation of karma points
- "Get started →" button

### Step 2 — What are you into?
- Pick categories: Garden / Cleanup / Repair / Skill-share / Mutual aid (multi-select chips)
- Subtext: "We'll show you the most relevant projects first"
- Must pick at least one

### Step 3 — What can you share?
- Free-text skill input with add button (same UI as SkillsCard)
- Pre-suggested chips: Carpentry, Gardening, Cooking, Bike repair, First aid, Teaching
- Can skip ("I'll add later")

### Step 4 — You're in
- Shows their karma starting balance (0 pts, Level 1 "Neighbor")
- "Let's go →" triggers `POST /api/auth/onboarding` then closes modal

---

## Database Models

### `users`
| column | type | notes |
|---|---|---|
| id | integer PK | |
| name | text | "Morgan R." |
| initials | text | derived from name on signup |
| email | text | unique |
| password_hash | text | bcrypt |
| karma_points | integer | default 0 |
| level | integer | default 1 |
| skills | text | JSON array |
| interests | text | JSON array of CategoryNames |
| onboarding_complete | boolean | default false |

No seed user — users are created via signup.

---

### `projects`
| column | type | notes |
|---|---|---|
| id | integer PK | |
| cat | text | |
| icon | text | derived from cat |
| title | text | |
| desc | text | nullable |
| place | text | |
| when | text | display string |
| karma | integer | reward |
| host_id | integer FK → users.id | replaces hardcoded host/host_name |
| dist | text | display string |
| cap | integer | |

`host` initials and `host_name` are joined from the users table at query time.
`joined`, `pct`, `bookmarked`, `is_mine` computed at query time.

Seed: 5 rows using a seeded demo user as host.

---

### `project_memberships`
| column | type | notes |
|---|---|---|
| id | integer PK | |
| project_id | integer FK → projects.id | |
| user_id | integer FK → users.id | |

Unique `(project_id, user_id)`

---

### `project_bookmarks`
| column | type | notes |
|---|---|---|
| id | integer PK | |
| project_id | integer FK → projects.id | |
| user_id | integer FK → users.id | |

Unique `(project_id, user_id)`

---

### `workshops`
| column | type | notes |
|---|---|---|
| id | integer PK | |
| skill | text | |
| cat | text | |
| icon | text | derived from cat |
| host_id | integer FK → users.id | |
| when | text | |
| place | text | |
| seats | integer | |
| level | text | "Beginner" / "All levels" |

`taken`, `seats_left`, `full`, `attending`, `is_mine` computed at query time.

Seed: 4 rows using a seeded demo user as host.

---

### `workshop_memberships`
| column | type | notes |
|---|---|---|
| id | integer PK | |
| workshop_id | integer FK → workshops.id | |
| user_id | integer FK → users.id | |
| on_waitlist | boolean | |

Unique `(workshop_id, user_id)`

---

### `skill_requests`
| column | type | notes |
|---|---|---|
| id | integer PK | |
| skill | text | |
| count | integer | |

Seed: 4 rows. Read-only at runtime.

---

### `resources`
| column | type | notes |
|---|---|---|
| id | integer PK | |
| title | text | |
| description | text | |
| source | text | |
| icon | text | |
| order | integer | display order |

Seed: 6 rows. Read-only at runtime.

---

## Karma Level System

| level | name | min pts | max pts |
|---|---|---|---|
| 1 | Neighbor | 0 | 149 |
| 2 | Helper | 150 | 399 |
| 3 | Connector | 400 | 749 |
| 4 | Cornerstone | 750 | 1499 |
| 5 | Keystone | 1500 | 2999 |
| 6 | Pillar | 3000 | — |

New users start at 0 / Level 1 "Neighbor".

---

## Category → Icon Map

| cat | icon |
|---|---|
| Garden | sprout |
| Cleanup | trend |
| Repair | wrench |
| Skill-share | bulb |
| Mutual aid | heart |

---

## New Dependencies Needed

| package | why |
|---|---|
| `bcrypt` | password hashing |
| `python-jose[cryptography]` | JWT encode/decode |
| `python-multipart` | already present — needed for form parsing |

---

## File Structure

```
backend/
  main.py              existing — add routers + startup + seed
  config.py            existing — add JWT_SECRET setting
  database.py          existing
  models.py            NEW — all SQLAlchemy models
  schemas.py           NEW — all Pydantic request/response models
  auth.py              NEW — JWT encode/decode, password hash, get_current_user dependency
  seed.py              NEW — demo user + seed data (only runs if tables empty)
  routers/
    __init__.py
    auth.py            NEW — signup, login, me, onboarding
    projects.py        NEW — 4 project endpoints
    workshops.py       NEW — 3 workshop endpoints
    profile.py         NEW — 3 profile endpoints
    resources.py       NEW — GET /api/resources
    community.py       NEW — GET /api/skills/requested

frontend/src/
  context/
    AuthContext.tsx    NEW — token storage, current user, login/logout helpers
  pages/
    LoginPage.tsx      NEW — login + signup tabs
  components/
    OnboardingModal.tsx  NEW — 4-step modal shown after signup
```
