import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export const ToggleTheme = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      size="sm"
      variant="ghost"
      className={cn("w-full justify-start", className)}
    >
      <div className="flex gap-2 dark:hidden">
        <Moon className="size-5" />
        <span className="block lg:hidden"> Dark </span>
      </div>

      <div className="dark:flex gap-2 hidden">
        <Sun className="size-5" />
        <span className="block lg:hidden">Light</span>
      </div>

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
