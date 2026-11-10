"use client";
import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { ToggleTheme } from "./toogle-theme";
import { Logo } from "@/components/brand/logo";
import { useSession } from "@/hooks/use-session";
import { clearSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  { href: "/#about", label: "About" },
  { href: "/#rooms", label: "Rooms" },
  { href: "/#amenities", label: "Amenities" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#contact", label: "Contact" },
];

/**
 * Which home-page section is on screen, so the menu can mark it as current.
 * Only runs on "/" - every menu link points to a section of the home page.
 */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    const ids = routeList.map((r) => r.href.split("#")[1]);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }
        // The first section (in page order) that is on screen wins.
        const current = ids.find((id) => visible.has(id)) ?? null;
        setActive(current);
      },
      // A band across the upper-middle of the viewport, below the header.
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}

function AccountMenu({
  name,
  onLogout,
  mobile = false,
}: {
  name: string;
  onLogout: () => void;
  mobile?: boolean;
}) {
  return (
    <details className={cn("group relative", mobile && "w-full")}>
      <summary
        aria-label={`${name} account menu`}
        className={cn(
          "flex min-h-tap cursor-pointer list-none items-center gap-2 rounded-md px-3 font-bold text-foreground marker:hidden hover:bg-accent [&::-webkit-details-marker]:hidden",
          mobile ? "w-full border border-border" : "max-w-[14rem]"
        )}
      >
        <UserRound aria-hidden className="size-5 shrink-0 text-bronze" />
        <span className="truncate">{name}</span>
        <ChevronDown
          aria-hidden
          className="ml-auto size-5 shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>
      <div
        className={cn(
          "absolute right-0 z-50 mt-2 min-w-44 rounded-md border border-border bg-popover p-1 shadow-lg",
          mobile && "static mt-2 w-full shadow-none"
        )}
      >
        <button
          type="button"
          onClick={onLogout}
          className="flex min-h-tap w-full items-center gap-2 rounded-sm px-3 text-left font-bold text-foreground hover:bg-accent"
        >
          <LogOut aria-hidden className="size-5" />
          Log out
        </button>
      </div>
    </details>
  );
}

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const activeSection = useActiveSection(pathname === "/");
  const accountName =
    [session?.firstName, session?.lastName].filter(Boolean).join(" ") ||
    "My account";

  function handleLogout() {
    clearSession();
    setIsOpen(false);
    router.replace("/");
  }

  const isActive = (href: string) => activeSection === href.split("#")[1];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/90">
      <div className="container flex min-h-[4.5rem] items-center justify-between gap-2 py-2">
        <Link
          href="/"
          aria-label="Margin Hotel home"
          className="inline-flex min-h-tap shrink-0 items-center rounded-md"
        >
          <Logo tone="ink" className="text-sm sm:text-base" markClassName="size-8" />
        </Link>

        {/* Desktop */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {routeList.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "location" : undefined}
                    className={cn(
                      "relative inline-flex min-h-tap items-center rounded-md px-3 text-base text-foreground hover:bg-accent",
                      "after:absolute after:inset-x-3 after:bottom-1 after:h-[3px] after:rounded-full after:bg-bronze after:opacity-0 after:transition-opacity",
                      active && "font-bold after:opacity-100"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <AccountMenu name={accountName} onLogout={handleLogout} />
          ) : (
            <Button asChild variant="secondary">
              <Link href="/login">Log in</Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/book">Book now</Link>
          </Button>
          <ToggleTheme className="w-auto" />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 lg:hidden">
          <Button asChild size="sm" className="hidden min-[400px]:inline-flex">
            <Link href="/book">Book now</Link>
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="px-2.5">
                <Menu aria-hidden className="size-6" />
                <span>Menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent className="flex w-full max-w-sm flex-col gap-6">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation and account options
                </SheetDescription>
              </SheetHeader>

              <nav aria-label="Main">
                <ul className="flex flex-col gap-1">
                  {routeList.map(({ href, label }) => {
                    const active = isActive(href);
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={() => setIsOpen(false)}
                          aria-current={active ? "location" : undefined}
                          className={cn(
                            "flex min-h-12 items-center rounded-md border-l-4 border-transparent px-4 text-lg text-foreground hover:bg-accent",
                            active && "border-bronze bg-muted font-bold"
                          )}
                        >
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-auto flex flex-col gap-3 border-t border-border pt-5">
                {session && (
                  <AccountMenu name={accountName} mobile onLogout={handleLogout} />
                )}
                <Button asChild size="lg">
                  <Link href="/book" onClick={() => setIsOpen(false)}>
                    Book now
                  </Link>
                </Button>
                {!session && (
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                )}
                <ToggleTheme />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
