"use client";
import { Menu } from "lucide-react";
import React from "react";
import Link from "next/link";
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
import { AuthButtons } from "@/components/auth/auth-buttons";

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

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

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
          <ToggleTheme className="w-auto text-ivory/80 hover:bg-white/10 hover:text-gold" />
          <Button asChild variant="gold" size="brand" className="h-10 px-6">
            <Link href="/book">Book Now</Link>
          </Button>
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

              <AuthButtons
                layout="stack"
                onNavigate={() => setIsOpen(false)}
              />

              <ToggleTheme />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

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
              </div>

      <div className="hidden lg:flex items-center gap-2">
        <AuthButtons />
        <ToggleTheme />
      </div>
    </header>
  );
};
