import { useId } from "react";
import { cn } from "@/lib/utils";

type LogoTone = "gold" | "white";

interface LogoMarkProps {
  tone?: LogoTone;
  className?: string;
  /** Render the mark for screen readers; hidden when used inside a wordmark. */
  title?: string;
}

/**
 * The Margin Hotel mark: a slim tower with a 2x4 window grid, standing on a
 * base line above three waves. Drawn on a 48-unit grid so it stays crisp from favicon size up.
 * Gold uses the soft metallic gradient; white is the reversed version for
 * dark or photographic backgrounds.
 */
export const LogoMark = ({ tone = "gold", className, title }: LogoMarkProps) => {
  const gradientId = `margin-gold-${useId().replace(/:/g, "")}`;
  const paint = tone === "gold" ? `url(#${gradientId})` : "currentColor";

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn(tone === "white" && "text-white", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {tone === "gold" && (
        <defs>
          <linearGradient id={gradientId} x1="10" y1="8" x2="38" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#b99a45" />
            <stop offset="0.5" stopColor="#f5e9a8" />
            <stop offset="1" stopColor="#b99a45" />
          </linearGradient>
        </defs>
      )}
      {/* Tower with a 2x4 grid of windows cut out */}
      <path fillRule="evenodd" fill={paint} d="M19 8h10v21H19zM21 10.5h2.2v2.2h-2.2zM24.8 10.5h2.2v2.2h-2.2zM21 14.5h2.2v2.2h-2.2zM24.8 14.5h2.2v2.2h-2.2zM21 18.5h2.2v2.2h-2.2zM24.8 18.5h2.2v2.2h-2.2zM21 22.5h2.2v2.2h-2.2zM24.8 22.5h2.2v2.2h-2.2z" />
      <g stroke={paint} strokeWidth="1.8" strokeLinecap="round">
        {/* Base line the building sits on */}
        <path d="M10 29.9h28" />
        {/* Waves */}
        <path d="M12 33.5c1.5-1.2 4.5-1.2 6 0s4.5 1.2 6 0 4.5-1.2 6 0 4.5 1.2 6 0" />
        <path d="M12 37.5c1.5-1.2 4.5-1.2 6 0s4.5 1.2 6 0 4.5-1.2 6 0 4.5 1.2 6 0" />
        <path d="M12 41.5c1.5-1.2 4.5-1.2 6 0s4.5 1.2 6 0 4.5-1.2 6 0 4.5 1.2 6 0" />
      </g>
    </svg>
  );
};

interface LogoProps {
  tone?: LogoTone;
  className?: string;
  /** Icon height; the wordmark scales with it. Tailwind size class, e.g. "size-7". */
  markClassName?: string;
}

/**
 * Primary lockup: MARGIN [mark] HOTEL in a wide-spaced geometric sans.
 * Brand rule: keep clear space around the lockup equal to the icon's height.
 */
export const Logo = ({ tone = "gold", className, markClassName = "size-8" }: LogoProps) => {
  const word = cn(
    "font-heading font-medium uppercase tracking-wide2",
    // Letter-spacing adds trailing space after the last letter - pull it back
    // so the mark sits optically centred between the two words.
    "[&>span]:-mr-[0.32em]",
    tone === "gold" ? "text-gold-metallic" : "text-white"
  );

  return (
    <span className={cn("inline-flex items-center gap-3 leading-none", className)}>
      <span className={word} aria-hidden="true">
        <span>Margin</span>
      </span>
      <LogoMark tone={tone} className={cn("shrink-0", markClassName)} />
      <span className={word} aria-hidden="true">
        <span>Hotel</span>
      </span>
      <span className="sr-only">Margin Hotel</span>
    </span>
  );
};

/** Icon-only version: gold mark on a navy rounded square (favicon / app icon). */
export const LogoBadge = ({ className }: { className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center justify-center rounded-[22%] bg-navy p-[14%]",
      className
    )}
  >
    <LogoMark className="size-full" />
  </span>
);
