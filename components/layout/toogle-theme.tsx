import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** Light/dark switch. Icon-only on wide screens, labelled in menus. */
export const ToggleTheme = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <Button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      variant="ghost"
      className={cn("w-full justify-start", className)}
    >
      <Moon aria-hidden className="dark:hidden" />
      <Sun aria-hidden className="hidden dark:block" />
      {/* Text is CSS-switched (no hydration mismatch); visually hidden on
          wide screens but still the button's accessible name. */}
      <span className="max-lg:contents lg:sr-only">
        <span className="dark:hidden">Dark theme</span>
        <span className="hidden dark:inline">Light theme</span>
      </span>
    </Button>
  );
};
