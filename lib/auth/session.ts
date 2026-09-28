// lib/auth/session.ts

export type AuthSession = {
  jwtToken: string;
  email: string;
  role: "USER" | "ADMIN" | "RECEPTIONIST";
};

const STORAGE_KEY = "marginHotelAuth";

export function saveSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    // Corrupted value: clear it rather than crash
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function getToken(): string | null {
  return getSession()?.jwtToken ?? null;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}