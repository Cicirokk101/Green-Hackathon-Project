# Hackathon Judging — Gap Analysis

> The Green Hackathon · June 12–14, 2026  
> Four criteria, 25% each. Max 5 per criterion. This file maps where we are honest and where we need to close gaps.

---

## Current honest score estimate

| Criterion | Current | Target | Gap |
|---|---|---|---|
| Scalability | 2 / 5 | 5 / 5 | SQLite single-writer, no auth, 1 worker |
| Universality | 2 / 5 | 5 / 5 | Hardcoded to Maplewood, English-only |
| User-Friendly | 3 / 5 | 5 / 5 | Desktop-only layout, no a11y, no onboarding |
| Equitable | 3 / 5 | 5 / 5 | Karma points decorative — not earned end-to-end |

**Estimated composite: 10 / 20 (50%).** Gaps below are ranked by impact-vs-effort.

---

## 1 · Scalability — Can it sustain 10,000 users?

### What we have built
- FastAPI + async SQLAlchemy (correct async-first foundation)
- Dockerized, deployed on fly.io (LAX) with HTTPS enforced
- Persistent SQLite volume mounted at `/data`
- `/api/health` endpoint
- Multi-stage Docker build (frontend static served by backend)
- 79/79 API tests pass against in-memory SQLite
- Async join/leave/bookmark with `IntegrityError` idempotency guards

### What's blocking a 5
- **SQLite is a single-writer DB.** Any concurrent write — two users joining the same workshop — will queue or error. 10k users means this breaks fast.
- **`--workers 1` in Dockerfile CMD.** A single uvicorn process. No horizontal scale path.
- **`STUB_USER_ID = 1` everywhere.** No auth at all — every visitor is the same person. Security score is effectively 0.
- **No rate limiting.** Any endpoint can be hammered freely.
- **`auto_stop_machines = 'stop'` on fly.io.** Machine goes cold between users, adding 2–5s cold starts.
- **No connection pool config.** SQLAlchemy defaults; will exhaust under load.

### What to do (ordered by impact)

1. **Switch SQLite → PostgreSQL on fly.io** (`fly postgres create`, update `DATABASE_URL`). This is the single highest-impact change. Removes the write-serialization ceiling and enables multiple workers.
   ```toml
   # fly.toml
   [env]
     DATABASE_URL = "postgresql+asyncpg://..."
   ```
   ```python
   # database.py — swap create_async_engine URL
   ```

2. **Add basic auth (JWT or session cookie).** Even a stub bearer token that sets `user_id` removes `STUB_USER_ID = 1`. Judges will ask "how do you know who's who?"
   ```python
   # middleware that reads Authorization: Bearer <token> and injects user_id
   # FastAPI Depends pattern — one file, wires everywhere via Depends(current_user)
   ```

3. **Increase workers** in `Dockerfile` CMD:
   ```dockerfile
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
   ```

4. **Add rate limiting** (1–2 hours work):
   ```bash
   uv add slowapi
   ```
   Apply to join/leave/bookmark routes. Prevents abuse demo.

5. **Set `min_machines_running = 1`** in `fly.toml` to eliminate cold starts during the demo:
   ```toml
   min_machines_running = 1
   ```

6. **Add a second fly.io region** (e.g., `iad`) to show geographic scale intent:
   ```bash
   fly regions add iad
   ```

---

## 2 · Universality — Does it work worldwide, out of the box?

### What we have built
- Categories (Garden, Cleanup, Repair, Skill-share, Mutual aid) — universally understood concepts
- UTC datetimes stored in DB; `formatWhen()` uses browser locale
- Karma as a non-monetary exchange unit (no currency dependency)
- Clean icon-based UI reduces language dependency

### What's blocking a 5
- **"Maplewood" is hardcoded in four places** (ProjectsPage hero, CommunityPage hero, App nav text). Judges from Hong Kong see "Maplewood · within 2 miles" and know this won't transfer.
- **"within 2 miles" hardcoded** — US units, single location.
- **English-only UI.** No i18n strings, no language switcher.
- **`en-US` locale** hardcoded in `formatWhen()` — dates render wrong outside the US.
- **`primary_region = 'lax'`** — LAX-only latency will be visible from Europe/Asia during demo.
- **No RTL support** for Arabic, Hebrew, Farsi-speaking communities.

### What to do (ordered by impact)

1. **Replace "Maplewood" with a configurable neighborhood name** — single env var or DB config row:
   ```ts
   // frontend: read from /api/config or env
   const NEIGHBORHOOD = import.meta.env.VITE_NEIGHBORHOOD ?? "Your Neighborhood";
   ```
   Costs 30 minutes. Immediately makes the demo say "This works anywhere."

2. **Fix `formatWhen()` to use `navigator.language`** instead of hardcoded `en-US`:
   ```ts
   export function formatWhen(iso: string): string {
     const d = new Date(iso);
     const locale = navigator.language;  // browser-reported locale
     return d.toLocaleString(locale, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
   }
   ```

3. **Extract all UI strings to a `strings.ts` file.** Even without a language switcher, showing the structure signals i18n readiness:
   ```ts
   // lib/strings.ts
   export const S = {
     reserveSeat: "Reserve a seat",
     leaveWaitlist: "Leave waitlist",
     ...
   }
   ```

4. **Add one non-English demo mode** (e.g., Spanish) in mock data to show the judges the system can do it. A `?lang=es` query param that swaps to `strings.es.ts` fixtures is enough.

5. **Add a second fly.io region** (covers Scalability too — double the value):
   ```bash
   fly regions add sin  # Singapore for Asia coverage
   ```

---

## 3 · User-Friendly — Can anyone, any age, use it with ease?

### What we have built
- Clean card-based design with consistent visual hierarchy
- Color-coded categories (gradient headers, category tags)
- Seat counts, progress bars, karma badges — at-a-glance state
- Reserve/waitlist flow with optimistic UI updates
- Category filter row on Projects page
- "Loading…" state while fetching
- `formatWhen()` makes dates human-readable
- TopNav with active page indicator

### What's blocking a 5
- **No mobile layout.** `gridTemplateColumns: "1fr 300px"` and `gridTemplateColumns: "1fr 1fr"` collapse badly on a phone. Most of the world uses mobile-first.
- **No accessibility.** No `aria-label`, no keyboard navigation, no screen-reader testing. Button color contrasts not audited.
- **No onboarding.** `onboarding_complete` exists in the User model but nothing leads a new user through the app.
- **No loading skeletons.** "Loading…" as plain text in the middle of the page.
- **No error UI.** If the API fails, the page shows nothing and there's no message.
- **Small font sizes.** Many labels at 11.5–13px — a problem for older adults (the judging criterion specifically says "any age").
- **No empty-state guidance.** `"No projects in this category yet."` is a dead end — no call to action to create one.

### What to do (ordered by impact)

1. **Mobile layout** — replace 2-column grids with a responsive approach:
   ```tsx
   gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))"
   // sidebar becomes full-width below 768px
   ```
   This alone closes the biggest gap. Most hackathon demos happen on phones or projected laptops.

2. **Add `aria-label` to all interactive elements** (1 hour):
   ```tsx
   <Button aria-label={`Reserve seat for ${w.skill}`} ...>Reserve a seat</Button>
   <IconButton name="bookmark" aria-label={`Bookmark ${p.title}`} .../>
   ```

3. **Minimum font size 14px everywhere.** Find/replace all `fontSize: 11.5` and `fontSize: 12` instances and bump to 14.

4. **Simple onboarding banner** for first-time visitors (reads `localStorage`):
   ```tsx
   // If no "karma-visited" in localStorage, show a 3-step "here's how this works" overlay
   ```

5. **Empty-state CTAs** on Projects and Community:
   ```tsx
   // No projects? → "Be the first. Start a project →"
   // No workshops? → "Know something? Host a workshop →"
   ```

6. **Loading skeletons** instead of "Loading…" text — 3 placeholder cards with a shimmer animation.

---

## 4 · Equitable — Does it serve users reciprocally, not extractively?

### What we have built
- Karma points as a **non-monetary, reciprocal exchange unit** — you give, you receive, no money changes hands
- Projects and workshops have `karma` values that signal the give/receive balance
- `SkillRequest` model and endpoint — community can surface what they need
- `ProjectBookmark` — save without committing
- **Mutual aid** as a first-class category
- No ads, no tracking, no third-party analytics
- No dark patterns (no fake urgency, no countdown timers)
- HTTPS-enforced, no data selling surface
- Seed data represents realistic community exchange scenarios

### What's blocking a 5
- **Karma points are decorative.** Morgan R. shows 1,240 karma but joining a project doesn't award points — `karma_points` never changes. The reciprocal loop is broken at the most important moment.
- **No mechanism for users to request a skill** — `SkillRequest` rows are seeded/static, not user-submitted.
- **No completion/confirmation flow.** You join a project but the system never acknowledges you showed up or awarding karma.
- **No transparency on where karma goes.** What does 1,240 karma mean? What can you spend it on? The system needs to answer this to feel empowering, not just point-collecting.

### What to do (ordered by impact)

1. **Award karma when you join a project or workshop** — wire the loop:
   ```python
   # In join_project:
   user = await db.get(User, STUB_USER_ID)
   user.karma_points += project.karma
   await db.commit()
   ```
   Now the number in the TopNav changes when you act. This is the biggest narrative moment for judges.

2. **Show karma earned in the join confirmation.** After clicking "Join":
   ```
   "You're in! You'll earn 40 karma for showing up."
   ```

3. **Add a "Request a skill" form** on the Community page sidebar (writes to `SkillRequest`). Closes the loop between "what does the community need" and user agency.

4. **Karma explainer card** — add to Resources or Profile page: "1 karma = 1 hour helped. 12 karma = the neighbor owl (Level 2)." Makes the system legible, not opaque.

5. **Show the reciprocal balance** on Profile: "You've given 40 karma. You've received 25. You're in credit." This is the core anti-extractive claim — show it visually.

---

## Quick wins (under 2 hours, cross-criterion)

| Change | Criteria | Effort |
|---|---|---|
| Replace "Maplewood" with env var | Universality | 30 min |
| Fix `formatWhen` to `navigator.language` | Universality | 15 min |
| `min_machines_running = 1` in fly.toml | Scalability | 5 min |
| `--workers 4` in Dockerfile | Scalability | 5 min |
| Bump all sub-14px font sizes | User-Friendly | 20 min |
| Empty-state CTAs on Projects + Community | User-Friendly | 30 min |
| Award karma on project join | Equitable | 45 min |
| "You'll earn X karma" join confirmation | Equitable | 20 min |

---

## What's in good shape (talk to these in the demo)

- **All 14 API endpoints tested and live** — workshops, projects, join, leave, bookmark, skill requests, resources
- **79/79 backend tests passing** — comprehensive coverage of edge cases (waitlist, duplicate join, cascade delete)
- **Async FastAPI** — correct foundation for scale; not fighting the framework
- **Docker + fly.io** — actually deployed, not just local
- **Persistent DB volume** — data survives redeploys
- **HTTPS enforced** — security baseline met
- **Karma system is conceptually anti-extractive** — no ads, no data extraction, no dark patterns
- **Mutual aid is a first-class category** — not bolted on
- **Mock toggle** — dev/demo resilience without touching backend
