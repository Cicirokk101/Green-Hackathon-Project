import type { IconName } from "./icons";
import type { CategoryName } from "./karma";
import { getToken } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Real network call to the FastAPI backend. */
async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Stubbed call for endpoints not yet wired to the backend — delays then returns {}. */
async function mockRequest<T>(): Promise<T> {
  await delay();
  return {} as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authRegister = (body: { name: string; email: string; password: string }): Promise<TokenOut> =>
  request<TokenOut>("POST", "/api/auth/register", body);

export const authLogin = (body: { email: string; password: string }): Promise<TokenOut> =>
  request<TokenOut>("POST", "/api/auth/login", body);

export const authMe = (): Promise<UserDTO> =>
  request<UserDTO>("GET", "/api/auth/me");

// ── Projects ──────────────────────────────────────────────────────────────────

/** GET /api/projects — list projects, optionally filtered by category */
export const getProjects = (cat?: CategoryName): Promise<ProjectListDTO> => {
  const qs = cat ? `?cat=${encodeURIComponent(cat)}` : "";
  return request<ProjectListDTO>("GET", `/api/projects${qs}`);
};

/** POST /api/projects — create a new project */
export const createProject = (body: ProjectCreateDTO): Promise<ProjectDTO> =>
  request<ProjectDTO>("POST", "/api/projects", body);

/** DELETE /api/projects/:id — delete a project you created */
export const deleteProject = (projectId: number): Promise<void> =>
  request<void>("DELETE", `/api/projects/${projectId}`);

/** POST /api/projects/:id/join — join a project */
export const joinProject = (projectId: number) =>
  request<JoinProjectResponseDTO>("POST", `/api/projects/${projectId}/join`);

/** DELETE /api/projects/:id/join — leave a project */
export const leaveProject = (projectId: number) =>
  request<LeaveProjectResponseDTO>("DELETE", `/api/projects/${projectId}/join`);

/** POST /api/projects/:id/bookmark — toggle bookmark on a project */
export const bookmarkProject = (projectId: number) =>
  request<BookmarkResponseDTO>("POST", `/api/projects/${projectId}/bookmark`);

// ── Users ─────────────────────────────────────────────────────────────────────

/** GET /api/users/me — fetch the current user's profile */
export const getMe = (): Promise<UserDTO> => request<UserDTO>("GET", "/api/users/me");

/** PATCH /api/users/me — update the current user's skills */
export const updateSkills = (skills: string[]): Promise<UserDTO> =>
  request<UserDTO>("PATCH", "/api/users/me", { skills });

// ── Workshops ─────────────────────────────────────────────────────────────────

/** GET /api/workshops — list all upcoming workshops with seat counts */
export const getWorkshops = () => mockRequest<WorkshopDTO[]>();

/** POST /api/workshops/:id/reserve — reserve a seat for the current user */
export const reserveSeat = (_workshopId: string) =>
  mockRequest<ReservationDTO>();

/** DELETE /api/workshops/:id/reserve — cancel the current user's reservation */
export const cancelReservation = (_workshopId: string) =>
  mockRequest<void>();

/** POST /api/workshops/:id/waitlist — join the waitlist when workshop is full */
export const joinWaitlist = (_workshopId: string) =>
  mockRequest<WaitlistDTO>();

/** GET /api/workshops/:id/reservations/me — check if current user has reserved */
export const getMyReservation = (_workshopId: string) =>
  mockRequest<ReservationDTO | null>();

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface WorkshopDTO {
  id: string;
  skill: string;
  category: string;
  hostId: string;
  hostName: string;
  when: string;
  place: string;
  seats: number;
  taken: number;
  level: string;
}

export interface ReservationDTO {
  id: string;
  workshopId: string;
  userId: string;
  reservedAt: string;
}

export interface WaitlistDTO {
  id: string;
  workshopId: string;
  userId: string;
  position: number;
}

export interface ProjectDTO {
  id: number;
  cat: CategoryName;
  icon: IconName;
  title: string;
  desc: string | null;
  place: string;
  when: string;
  karma: number;
  host_id: number;
  host_initials: string;
  host_name: string;
  joined: number;
  cap: number;
  pct: number;
  bookmarked: boolean;
  is_mine: boolean;
  joined_by_me: boolean;
  created_at: string;
}

export interface ProjectListDTO {
  total: number;
  items: ProjectDTO[];
}

export interface ProjectCreateDTO {
  cat: CategoryName;
  title: string;
  desc: string | null;
  when: string;
  place: string;
  cap: number;
  karma: number;
}

export interface JoinProjectResponseDTO {
  success: boolean;
  joined: number;
  pct: number;
}

export interface LeaveProjectResponseDTO {
  success: boolean;
  joined: number;
  pct: number;
}

export interface BookmarkResponseDTO {
  bookmarked: boolean;
}

export interface UserDTO {
  id: number;
  name: string;
  initials: string;
  karma_points: number;
  skills: string[];
  interests: string[];
  level: number;
}

export interface TokenOut {
  token: string;
  user: UserDTO;
}
