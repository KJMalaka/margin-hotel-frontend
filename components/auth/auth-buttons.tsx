"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  clearSession,
  getSession,
  type AuthSession,
} from "@/lib/auth/session";

type AuthButtonsProps = {
  // "row" for the desktop navbar, "stack" for the mobile menu
  layout?: "row" | "stack";
  // Called after a link click or logout, e.g. to close the mobile menu
  onNavigate?: () => void;
};

/**
 * Shows Login / Sign up when logged out, and Log out (plus an Admin link for
 * staff) when logged in. The session lives in localStorage, which the server
 * can't read, so it is checked after mount. Until then nothing is rendered,
 * so a logged-in user never sees "Login" flash up.
 */
export function AuthButtons({ layout = "row", onNavigate }: AuthButtonsProps) {
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setChecked(true);
  }, [pathname]);

  function handleLogout() {
    clearSession();
    setSession(null);
    onNavigate?.();
  }

  if (!checked) return null;

  const stacked = layout === "stack";
  const containerClass = stacked
    ? "flex w-full flex-col gap-2"
    : "flex items-center gap-2";

  if (!session) {
    return (
      <div className={containerClass}>
        <Button
          asChild
          variant="ghost"
          className={stacked ? "justify-start text-base" : undefined}
        >
          <Link href="/login" onClick={onNavigate}>
            Login
          </Link>
        </Button>
        <Button asChild className={stacked ? "w-full" : undefined}>
          <Link href="/signup" onClick={onNavigate}>
            Sign up
          </Link>
        </Button>
      </div>
    );
  }

  const isStaff = session.role !== "USER";

  return (
    <div className={containerClass}>
      {isStaff && (
        <Button
          asChild
          variant="ghost"
          className={stacked ? "justify-start text-base" : undefined}
        >
          <Link href="/admin/invoices" onClick={onNavigate}>
            Admin
          </Link>
        </Button>
      )}
      <Button
        variant="outline"
        onClick={handleLogout}
        className={stacked ? "w-full" : undefined}
      >
        Log out
      </Button>
    </div>
  );
}