"use client";
import { useEffect, useState } from "react";
import { getSession, type AuthSession } from "@/lib/auth/session";

export function useSession() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const update = () => setSession(getSession());
    update();
    window.addEventListener("auth-change", update);
    window.addEventListener("storage", update); // other tabs
    return () => {
      window.removeEventListener("auth-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return session;
}