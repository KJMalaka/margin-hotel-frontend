"use client";
import { ChevronDown, Menu, UserRound } from "lucide-react";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { ToggleTheme } from "./toogle-theme";
import { Logo } from "@/components/brand/logo";
import { useSession } from "@/hooks/use-session";
import { clearSession } from "@/lib/auth/session";

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

const linkClass =
  "font-heading text-[0.7rem] font-medium uppercase tracking-brand text-ivory/85 transition-colors duration-300 hover:text-gold focus-visible:text-gold";

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
    <details className={`group relative ${mobile ? "w-full" : ""}`}>
      <summary
        aria-label={`${name} account menu`}
        className={`flex cursor-pointer list-none items-center gap-2 text-sm text-ivory/85 marker:hidden hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
          mobile ? "w-full py-2" : "max-w-[220px]"
        }`}
      >
        <UserRound className="size-4 shrink-0 text-gold" />
        <span className="truncate">{name}</span>
        <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div
        className={`absolute right-0 z-50 mt-2 min-w-40 rounded-md border border-gold/25 bg-navy p-1 shadow-lg ${
          mobile ? "left-0 right-auto w-full" : ""
        }`}
      >
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-sm px-3 py-2 text-left text-sm text-ivory/85 transition-colors hover:bg-white/10 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Logout
        </button>
      </div>
    </details>
  );
}

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const session = useSession();
  const router = useRouter();
  const accountName =
    [session?.firstName, session?.lastName].filter(Boolean).join(" ") ||
    "My account";

  function handleLogout() {
    clearSession();
    setIsOpen(false);
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-navy border-b border-gold/25">
      {/* h-24 around a 28px mark gives clear space above/below >= the icon's height. */}
      <div className="container flex h-24 items-center justify-between gap-8">
        <Link href="/" aria-label="Margin Hotel home" className="shrink-0">
          <Logo className="text-[0.8rem] sm:text-sm" markClassName="size-7" />
        </Link>

        {/* Desktop */}
        <nav aria-label="Main" className="hidden lg:flex items-center gap-9">
          {routeList.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button asChild variant="gold" size="brand" className="h-10 px-6">
            <Link href="/book">Book Now</Link>
          </Button>

          {session ? (
            <AccountMenu name={accountName} onLogout={handleLogout} />
          ) : (
            <Button asChild variant="goldOutline" size="brand" className="h-10 px-6">
              <Link href="/login">Login</Link>
            </Button>
          )}

          <ToggleTheme className="w-auto text-ivory/80 hover:bg-white/10 hover:text-gold" />
        </div>

        {/* Mobile */}
        <div className="flex items-center lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-ivory hover:bg-white/10 hover:text-gold"
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>

            <SheetContent className="w-full max-w-sm border-gold/25 bg-navy text-ivory">
              <SheetHeader>
                <SheetTitle className="font-heading text-left text-ivory">
                  Menu
                </SheetTitle>
              </SheetHeader>

              {session && (
                <div className="mt-4">
                  <AccountMenu
                    name={accountName}
                    mobile
                    onLogout={handleLogout}
                  />
                </div>
              )}

              <nav aria-label="Main" className="flex flex-col">
                {routeList.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`${linkClass} border-b border-gold/15 py-4 text-xs`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <SheetFooter className="mt-6 flex-col gap-3 sm:flex-col sm:space-x-0">
                <Button asChild variant="gold" className="w-full">
                  <Link href="/book" onClick={() => setIsOpen(false)}>
                    Book Now
                  </Link>
                </Button>

                {!session && (
                  <Button asChild variant="goldOutline" className="w-full">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Login
                    </Link>
                  </Button>
                )}

                <ToggleTheme />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};