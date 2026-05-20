const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(`API error ${response.status}: ${error}`, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Calendar {
  id: string;
  name: string;
  owner_id: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarCreate {
  name: string;
  owner_id?: string;
  color?: string;
  is_default?: boolean;
}

export interface CalendarUpdate {
  name?: string;
  owner_id?: string;
  color?: string;
  is_default?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  timezone: string;
  location: string | null;
  organizer_id: string | null;
  calendar_id: string;
  recurrence_rule: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventCreate {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  timezone?: string;
  location?: string;
  organizer_id?: string;
  calendar_id: string;
  recurrence_rule?: string;
}

export interface EventUpdate {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  timezone?: string;
  location?: string;
  organizer_id?: string;
  calendar_id?: string;
  recurrence_rule?: string;
}

export type AttendeeStatus = "pending" | "accepted" | "declined" | "tentative";
export type AttendeeType = "required" | "optional";

export interface Attendee {
  id: string;
  event_id: string;
  email: string;
  name: string | null;
  status: AttendeeStatus;
  type: AttendeeType;
  created_at: string;
  updated_at: string;
}

export interface AttendeeCreate {
  event_id: string;
  email: string;
  name?: string;
  status?: AttendeeStatus;
  type?: AttendeeType;
}

export interface AttendeeUpdate {
  email?: string;
  name?: string;
  status?: AttendeeStatus;
  type?: AttendeeType;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function getHealth() {
  return fetchJson<{ status: string }>("/health/");
}

// ─── Calendars ────────────────────────────────────────────────────────────────

export async function listCalendars(): Promise<Calendar[]> {
  return fetchJson("/api/v1/calendars/");
}

export async function createCalendar(data: CalendarCreate): Promise<Calendar> {
  return fetchJson("/api/v1/calendars/", { method: "POST", body: JSON.stringify(data) });
}

export async function getCalendar(id: string): Promise<Calendar> {
  return fetchJson(`/api/v1/calendars/${id}`);
}

export async function updateCalendar(id: string, data: CalendarUpdate): Promise<Calendar> {
  return fetchJson(`/api/v1/calendars/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteCalendar(id: string): Promise<void> {
  return fetchJson(`/api/v1/calendars/${id}`, { method: "DELETE" });
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function listEvents(params?: {
  calendar_id?: string;
  start?: string;
  end?: string;
}): Promise<CalendarEvent[]> {
  const query = new URLSearchParams();
  if (params?.calendar_id) query.set("calendar_id", params.calendar_id);
  if (params?.start) query.set("start", params.start);
  if (params?.end) query.set("end", params.end);
  const qs = query.toString() ? `?${query}` : "";
  return fetchJson(`/api/v1/events/${qs}`);
}

export async function createEvent(data: EventCreate): Promise<CalendarEvent> {
  return fetchJson("/api/v1/events/", { method: "POST", body: JSON.stringify(data) });
}

export async function getEvent(id: string): Promise<CalendarEvent> {
  return fetchJson(`/api/v1/events/${id}`);
}

export async function updateEvent(id: string, data: EventUpdate): Promise<CalendarEvent> {
  return fetchJson(`/api/v1/events/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteEvent(id: string): Promise<void> {
  return fetchJson(`/api/v1/events/${id}`, { method: "DELETE" });
}

// ─── Attendees ────────────────────────────────────────────────────────────────

export async function listAttendees(params?: { event_id?: string }): Promise<Attendee[]> {
  const query = params?.event_id ? `?event_id=${params.event_id}` : "";
  return fetchJson(`/api/v1/attendees/${query}`);
}

export async function createAttendee(data: AttendeeCreate): Promise<Attendee> {
  return fetchJson("/api/v1/attendees/", { method: "POST", body: JSON.stringify(data) });
}

export async function updateAttendee(id: string, data: AttendeeUpdate): Promise<Attendee> {
  return fetchJson(`/api/v1/attendees/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteAttendee(id: string): Promise<void> {
  return fetchJson(`/api/v1/attendees/${id}`, { method: "DELETE" });
}

export { ApiError };
