# Auth Implementation Plan

## Stack
- **Backend:** `python-jose[cryptography]` (JWT signing) + `passlib[bcrypt]` (password hashing)
- **Frontend:** `localStorage` token + `Authorization: Bearer` header on every request
- **No third-party services.** Works offline, works in demo, fully auditable code.

---

## How it works end to end

```
REGISTER
  POST /api/auth/register { name, email, password }
  → hash password with bcrypt
  → create User row in DB
  → sign JWT containing { user_id, exp: 7 days }
  → return { token, user }

LOGIN
  POST /api/auth/login { email, password }
  → look up User by email
  → verify bcrypt(password) against stored hash
  → sign new JWT
  → return { token, user }

EVERY PROTECTED REQUEST
  client sends: Authorization: Bearer <token>
  → backend decodes JWT, reads user_id
  → fetches User from DB
  → injects User into route via Depends(get_current_user)
  → route runs with the real user, not STUB_USER_ID = 1
```

---

## New endpoints

| Method | Path | Auth required | Body | Returns |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | `{ name, email, password }` | `{ token, user }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ token, user }` |
| GET | `/api/auth/me` | Yes | — | `UserOut` |

All existing endpoints stay the same — they just get `STUB_USER_ID = 1` replaced with `Depends(get_current_user)`.

---

## Backend — files to create

### `backend/auth.py`
The core auth module. Three things:

```python
# 1. Password hashing
hash_password(plain: str) -> str          # bcrypt hash
verify_password(plain: str, hashed: str) -> bool

# 2. JWT
create_token(user_id: int) -> str         # signs JWT, 7-day expiry
decode_token(token: str) -> dict          # raises 401 if bad/expired

# 3. FastAPI dependency
get_current_user(token, db) -> User       # reads Bearer token, returns User row
```

Secret key lives in `config.py` as `secret_key: str` — reads from `SECRET_KEY` env var in prod, has a dev default locally.

### `backend/schemas/auth.py`
Three schemas:

```python
class RegisterIn(BaseModel):
    name: str
    email: str
    password: str       # plain text — we hash it immediately, never stored

class LoginIn(BaseModel):
    email: str
    password: str

class TokenOut(BaseModel):
    token: str
    user: UserOut
```

### `backend/routers/auth.py`
Three endpoints wired to the schemas and auth module above. Registered in `main.py` alongside the existing routers.

---

## Backend — files to update

### `backend/config.py`
Add `secret_key: str` field. Reads `SECRET_KEY` from environment. Dev default is a hardcoded string (fine locally, never used in prod).

### `backend/main.py`
Add one line to register the auth router:
```python
app.include_router(auth_router.router)
```

### `backend/routers/projects.py`, `workshops.py`, `users.py`
Replace `STUB_USER_ID = 1` with `user: User = Depends(get_current_user)` on every endpoint that needs identity. No other logic changes — the routes already use `user_id` correctly, they just get it from the wrong place right now.

### `backend/seed.py`
The demo user currently has `password_hash: "demo"` (plain text, not a real hash). Update to use `hash_password("demo")` so the seeded user actually works with the login endpoint.

---

## Frontend — files to create

### `src/lib/auth.ts`
Token storage. Three functions:
```ts
getToken(): string | null       // localStorage.getItem("token")
setToken(token: string): void   // localStorage.setItem("token", token)
clearToken(): void              // localStorage.removeItem("token")
```

### `src/context/AuthContext.tsx`
React context that holds the logged-in user and exposes:
```ts
{
  user: UserDTO | null
  isLoading: boolean
  login(email, password): Promise<void>     // calls POST /api/auth/login, stores token
  register(name, email, password): Promise<void>
  logout(): void                            // clears token, redirects to /login
}
```

On mount it calls `GET /api/auth/me` with the stored token to rehydrate the session. If it gets a 401, it clears the token.

### `src/pages/LoginPage.tsx`
Email + password form. On submit calls `login()` from AuthContext, redirects to `/` on success.

### `src/pages/RegisterPage.tsx`
Name + email + password form. On submit calls `register()`, redirects to `/` on success.

---

## Frontend — files to update

### `src/lib/api.ts`
The `request()` function currently sends no auth header. One change:
```ts
headers: {
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
}
```
Every existing API call automatically becomes authenticated — no other changes needed.

### `src/App.tsx`
- Wrap everything in `<AuthProvider>`
- Add `/login` and `/register` routes
- Add a protected route wrapper: if no token → redirect to `/login`

### `src/components/layout/TopNav.tsx`
Read the logged-in user from `AuthContext` instead of hardcoded seed data. Shows real name and karma total.

---

## Local development

**Install dependencies first:**
```bash
cd backend
uv add python-jose[cryptography] passlib[bcrypt]
```

**Delete and recreate the DB** after updating `seed.py` (password hash change):
```bash
rm backend/db.sqlite3
./start.sh
```

**Test auth endpoints** at `http://localhost:8000/docs` before touching the frontend:
1. `POST /api/auth/register` — create a new user, get back a token
2. `POST /api/auth/login` — login with `demo@karma.local` / `demo`
3. `GET /api/auth/me` — paste the token into the Authorize button in Swagger UI, confirm it returns the user

**Test the full flow** at `http://localhost:5173`:
1. Hit any page → should redirect to `/login`
2. Register a new account → should land on `/` with your name in the nav
3. Join a project → karma should update for YOUR user, not the seed user

---

## Production (fly.io)

**Set the secret key as a fly.io secret** — never hardcode it in prod:
```bash
fly secrets set SECRET_KEY="$(openssl rand -hex 32)"
```

Everything else deploys automatically with the existing Docker + fly.io pipeline. The JWT uses the same HS256 algorithm locally and in prod — the only difference is the `SECRET_KEY` value.

The seeded demo user (`demo@karma.local` / `demo`) will still exist in prod after the first deploy (seed only runs once, on a fresh DB). Useful for the demo.

---

## Build order

1. `backend/auth.py` — core module, no dependencies on anything new
2. `backend/schemas/auth.py` — schemas
3. `backend/routers/auth.py` — endpoints
4. Register auth router in `backend/main.py`
5. Add `secret_key` to `backend/config.py`
6. Fix seed.py demo user password hash
7. Replace `STUB_USER_ID` in all 3 routers
8. Delete DB, restart, test all 3 endpoints in Swagger
9. `src/lib/auth.ts` — token storage
10. Update `src/lib/api.ts` — add Bearer header
11. `src/context/AuthContext.tsx`
12. `src/pages/LoginPage.tsx` + `RegisterPage.tsx`
13. Protect routes in `src/App.tsx`
14. Wire `TopNav` to real user from context
