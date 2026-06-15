const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const MOCK = import.meta.env.VITE_MOCK_API === "true";

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  if (MOCK) {
    await delay();
    return {} as T;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

// ── User ID (no auth yet — stored in localStorage, defaults to 1) ─────────────

export function getCurrentUserId(): number {
  const stored = localStorage.getItem("userId");
  return stored ? parseInt(stored, 10) : 1;
}

export function setCurrentUserId(id: number): void {
  localStorage.setItem("userId", String(id));
}

// ── Users ─────────────────────────────────────────────────────────────────────

/** GET /api/users/:id — fetch a user's profile */
export const getUser = (userId: number) =>
  request<UserDTO>("GET", `/api/users/${userId}`);

/** PUT /api/users/:id — update a user's profile */
export const updateUser = (userId: number, body: UpdateUserDTO) =>
  request<UserDTO>("PUT", `/api/users/${userId}`, body);

/** GET /api/users/:id/stats — fetch sidebar counts for a user */
export const getUserStats = (userId: number) =>
  request<UserStatsDTO>("GET", `/api/users/${userId}/stats`);

// ── Projects ──────────────────────────────────────────────────────────────────

/** GET /api/projects — list projects, optionally filtered */
export const getProjects = (params?: ProjectsQueryParams) => {
  const userId = getCurrentUserId();
  const qs = new URLSearchParams({ user_id: String(userId) });
  if (params?.cat) qs.set("cat", params.cat);
  if (params?.host_id != null) qs.set("host_id", String(params.host_id));
  if (params?.joined_by != null) qs.set("joined_by", String(params.joined_by));
  if (params?.status) qs.set("status", params.status);
  return request<ProjectListDTO>("GET", `/api/projects?${qs}`);
};

/** GET /api/projects?joined_by=userId — projects the current user has joined */
export const getJoinedProjects = () => {
  const userId = getCurrentUserId();
  return getProjects({ joined_by: userId });
};

/** GET /api/projects?host_id=userId — projects the current user created */
export const getCreatedProjects = () => {
  const userId = getCurrentUserId();
  return getProjects({ host_id: userId });
};

/** POST /api/projects — create a new project */
export const createProject = (body: CreateProjectDTO) => {
  const userId = getCurrentUserId();
  return request<ProjectDTO>("POST", `/api/projects?user_id=${userId}`, body);
};

/** POST /api/projects/:id/join — join a project */
export const joinProject = (projectId: number) => {
  const userId = getCurrentUserId();
  return request<JoinProjectDTO>(
    "POST",
    `/api/projects/${projectId}/join?user_id=${userId}`
  );
};

/** POST /api/projects/:id/bookmark — toggle bookmark on a project */
export const bookmarkProject = (projectId: number) => {
  const userId = getCurrentUserId();
  return request<BookmarkDTO>(
    "POST",
    `/api/projects/${projectId}/bookmark?user_id=${userId}`
  );
};

// ── Workshops ─────────────────────────────────────────────────────────────────

/** GET /api/workshops — list all upcoming workshops with seat counts */
export const getWorkshops = () =>
  request<WorkshopDTO[]>("GET", "/api/workshops");

/** POST /api/workshops/:id/reserve — reserve a seat for the current user */
export const reserveSeat = (workshopId: string) =>
  request<ReservationDTO>("POST", `/api/workshops/${workshopId}/reserve`);

/** DELETE /api/workshops/:id/reserve — cancel the current user's reservation */
export const cancelReservation = (workshopId: string) =>
  request<void>("DELETE", `/api/workshops/${workshopId}/reserve`);

/** POST /api/workshops/:id/waitlist — join the waitlist when workshop is full */
export const joinWaitlist = (workshopId: string) =>
  request<WaitlistDTO>("POST", `/api/workshops/${workshopId}/waitlist`);

/** GET /api/workshops/:id/reservations/me — check if current user has reserved */
export const getMyReservation = (workshopId: string) =>
  request<ReservationDTO | null>(
    "GET",
    `/api/workshops/${workshopId}/reservations/me`
  );

/** POST /api/workshops — create a new workshop (host flow) */
export const createWorkshop = (body: CreateWorkshopDTO) =>
  request<WorkshopDTO>("POST", "/api/workshops", body);

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface UserDTO {
  id: number;
  name: string;
  handle: string | null;
  initials: string;
  location: string | null;
  bio: string | null;
  helping_status: string | null;
  skills: string[];
  interests: string[];
  badges: string[];
  karma_points: number;
  level: number;
  onboarding_complete: boolean;
  created_at: string;
}

export interface UpdateUserDTO {
  name?: string;
  handle?: string;
  location?: string;
  bio?: string;
  helping_status?: string;
  skills?: string[];
}

export interface UserStatsDTO {
  projects_joined_count: number;
  projects_created_count: number;
  workshops_hosting_count: number;
  workshops_attending_count: number;
  neighbors_helped_count: number;
  badges_count: number;
}

export interface ProjectsQueryParams {
  cat?: string;
  host_id?: number;
  joined_by?: number;
  status?: string;
}

export interface ProjectDTO {
  id: number;
  cat: string;
  icon: string;
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
  status: string;
  created_at: string;
}

export interface ProjectListDTO {
  total: number;
  items: ProjectDTO[];
}

export interface CreateProjectDTO {
  cat: string;
  title: string;
  desc?: string;
  when: string;
  place: string;
  cap: number;
  karma: number;
  status?: string;
}

export interface JoinProjectDTO {
  success: boolean;
  joined: number;
  pct: number;
}

export interface BookmarkDTO {
  bookmarked: boolean;
}

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

export interface CreateWorkshopDTO {
  skill: string;
  category: string;
  when: string;
  place: string;
  seats: number;
  level: string;
  description: string;
}
