const BASE_URL = import.meta.env.VITE_API_URL ?? "";
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
  const qs = new URLSearchParams();
  if (params?.cat) qs.set("cat", params.cat);
  if (params?.host_id != null) qs.set("host_id", String(params.host_id));
  if (params?.joined_by != null) qs.set("joined_by", String(params.joined_by));
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString();
  return request<ProjectListDTO>("GET", `/api/projects${query ? `?${query}` : ""}`);
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
export const createProject = (body: CreateProjectDTO) =>
  request<ProjectDTO>("POST", "/api/projects", body);

/** POST /api/projects/:id/join — join a project */
export const joinProject = (projectId: number) =>
  request<JoinProjectDTO>("POST", `/api/projects/${projectId}/join`);

/** POST /api/projects/:id/bookmark — toggle bookmark on a project */
export const bookmarkProject = (projectId: number) =>
  request<BookmarkDTO>("POST", `/api/projects/${projectId}/bookmark`);

// ── Workshops ─────────────────────────────────────────────────────────────────

/** GET /api/workshops — list workshops, optionally filtered */
export const getWorkshops = (params?: WorkshopsQueryParams) => {
  const qs = new URLSearchParams();
  if (params?.host_id != null) qs.set("host_id", String(params.host_id));
  if (params?.attendee_id != null) qs.set("attendee_id", String(params.attendee_id));
  const query = qs.toString();
  return request<WorkshopDTO[]>("GET", `/api/workshops${query ? `?${query}` : ""}`);
};

/** GET /api/workshops/:id — get a single workshop */
export const getWorkshop = (workshopId: number) =>
  request<WorkshopDTO>("GET", `/api/workshops/${workshopId}`);

/** POST /api/workshops — create a new workshop */
export const createWorkshop = (body: CreateWorkshopDTO) =>
  request<WorkshopDTO>("POST", "/api/workshops", body);

/** PATCH /api/workshops/:id — update a workshop (host only) */
export const updateWorkshop = (workshopId: number, body: UpdateWorkshopDTO) =>
  request<WorkshopDTO>("PATCH", `/api/workshops/${workshopId}`, body);

/** DELETE /api/workshops/:id — delete a workshop (host only) */
export const deleteWorkshop = (workshopId: number) =>
  request<void>("DELETE", `/api/workshops/${workshopId}`);

/** POST /api/workshops/:id/join — join a workshop (backend decides seat vs waitlist) */
export const joinWorkshop = (workshopId: number) =>
  request<JoinWorkshopDTO>("POST", `/api/workshops/${workshopId}/join`);

/** DELETE /api/workshops/:id/join — leave a workshop or cancel waitlist spot */
export const leaveWorkshop = (workshopId: number) =>
  request<LeaveWorkshopDTO>("DELETE", `/api/workshops/${workshopId}/join`);

/** GET /api/workshops/:id/join/:userId — check join status for a user */
export const getWorkshopJoinStatus = (workshopId: number, userId: number) =>
  request<JoinStatusDTO>("GET", `/api/workshops/${workshopId}/join/${userId}`);

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

export interface WorkshopsQueryParams {
  host_id?: number;
  attendee_id?: number;
}

export interface WorkshopDTO {
  id: number;
  skill: string;
  cat: string;
  icon: string;
  host_id: number;
  host_initials: string;
  host_name: string;
  when: string;
  place: string;
  seats: number;
  taken: number;
  seats_left: number;
  level: string;
  full: boolean;
  attending: boolean;
  is_mine: boolean;
  created_at: string;
}

export interface CreateWorkshopDTO {
  skill: string;
  cat: string;
  when: string;
  place: string;
  seats: number;
  level: string;
}

export interface UpdateWorkshopDTO {
  skill?: string;
  cat?: string;
  when?: string;
  place?: string;
  seats?: number;
  level?: string;
}

export interface JoinWorkshopDTO {
  success: boolean;
  on_waitlist: boolean;
  seats_left: number;
}

export interface LeaveWorkshopDTO {
  success: boolean;
  seats_left: number;
}

export interface JoinStatusDTO {
  joined: boolean;
  on_waitlist: boolean;
}
