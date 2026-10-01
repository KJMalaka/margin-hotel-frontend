"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, type AuthSession } from "@/lib/auth/session";

type Role = AuthSession["role"];

type AuthGuardProps = {
  allowedRoles: Role[];
  children: React.ReactNode;
};

/**
 * Client-side route guard. The JWT lives in localStorage, which the server
 * can't read, so the check runs in the browser after mount. Children are not
 * rendered until the check passes, so protected content never flashes.
 *
 * Note: this is a convenience for the UI, not security. The backend still
 * enforces access on every request.
 */
export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      setAllowed(false);
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(session.role)) {
      setAllowed(false);
      router.replace("/");
      return;
    }

    setAllowed(true);
  }, [pathname, router, allowedRoles]);

  if (!allowed) return null;

  return <>{children}</>;
}