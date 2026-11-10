import { useId } from "react";
import { cn } from "@/lib/utils";

/** gold: on navy · white: on photos · ink: on light surfaces */
type LogoTone = "gold" | "white" | "ink";

interface LogoMarkProps {
  tone?: LogoTone;
  className?: string;
  /** Render the mark for screen readers; hidden when used inside a wordmark. */
  title?: string;
}

/**
 * The Margin Hotel mark: a slim tower with a 2x4 window grid, standing on a
 * base line above three waves. Drawn on a 48-unit grid so it stays crisp from favicon size up.
 * Gold uses the soft metallic gradient (navy surfaces only); white is the
 * reversed version for photos; ink is the bronze mark for light surfaces.
 */
export const LogoMark = ({ tone = "gold", className, title }: LogoMarkProps) => {
  const gradientId = `margin-gold-${useId().replace(/:/g, "")}`;
  const paint = tone === "gold" ? `url(#${gradientId})` : "currentColor";

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn(tone === "white" && "text-white", tone === "ink" && "text-bronze", className)}
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
    // nowrap + overflow-wrap:normal: never break "Margin"/"Hotel" mid-word
    // (the global overflow-wrap: break-word would otherwise split them).
    "shrink-0 whitespace-nowrap font-heading font-bold uppercase tracking-[0.18em] [overflow-wrap:normal]",
    // Letter-spacing adds trailing space after the last letter - pull it back
    // so the mark sits optically centred between the two words.
    "[&>span]:-mr-[0.18em]",
    tone === "gold" ? "text-brand-gold" : tone === "ink" ? "text-foreground" : "text-white"
  );

  return (
    <span className={cn("inline-flex shrink-0 items-center gap-3 whitespace-nowrap leading-none", className)}>
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
      "inline-flex items-center justify-center rounded-md bg-brand p-[14%]",
      className
    )}
  >
    <LogoMark className="size-full" />
  </span>
);
