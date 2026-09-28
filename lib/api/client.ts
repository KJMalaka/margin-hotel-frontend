import { getToken, clearSession } from "@/lib/auth/session";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/marginhotel";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Login/register are public, so never attach a token to them.
const isAuthCall = (path: string) => path.startsWith("/auth/");

/**
 * Thin fetch wrapper. Throws ApiError on non-2xx responses so callers/forms
 * can surface a readable message instead of a raw fetch/network error.
 * Attaches the JWT (if one is stored) to every request except /auth/*.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;

  // Build headers once, and pass them AFTER ...init so a caller's own
  // headers can't wipe out Content-Type or Authorization.
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token && !isAuthCall(path)) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      "Couldn't reach the server. Check your connection and try again.",
      0
    );
  }

  if (!res.ok) {
    // 401 on a protected route = expired/invalid token, so drop the stored session.
    if (res.status === 401 && !isAuthCall(path)) {
      clearSession();
    }

    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message ?? body?.error ?? message;
    } catch {
      // Non-JSON error body, keep the default message.
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}