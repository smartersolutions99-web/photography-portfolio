import { API_BASE } from "./api";
import { clearToken, getToken, saveToken } from "./auth";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra ?? {}) };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function handleUnauthorized(status: number): void {
  if (status === 401 && typeof window !== "undefined") {
    clearToken();
    if (!window.location.pathname.endsWith("/admin/login")) {
      window.location.href = "/admin/login";
    }
  }
}

async function parseError(res: Response): Promise<never> {
  handleUnauthorized(res.status);
  let msg = `Greška (${res.status})`;
  try {
    const data = await res.json();
    if (data?.message) msg = data.message;
  } catch {
    /* ignore */
  }
  throw new ApiError(res.status, msg);
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) return parseError(res);
  return (await res.json()) as T;
}

export async function apiSend<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) return parseError(res);
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!res.ok) return parseError(res);
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new ApiError(res.status, res.status === 401 ? "Pogrešno korisničko ime ili lozinka." : "Greška pri prijavi.");
  }
  const data = (await res.json()) as { token: string };
  saveToken(data.token);
}
