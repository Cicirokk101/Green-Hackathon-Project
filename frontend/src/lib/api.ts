const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const MOCK = import.meta.env.VITE_MOCK_API === "true" || true;

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
