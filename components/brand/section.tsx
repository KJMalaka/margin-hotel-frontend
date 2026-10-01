import { cn } from "@/lib/utils";

type SectionTone = "light" | "white" | "navy";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  /**
   * Thin full-width rules - the brand's signature detail. Use "top" when the
   * section follows one that already draws a bottom rule.
   */
  rules?: "both" | "top" | "bottom" | "none";
}

const toneClasses: Record<SectionTone, string> = {
  light: "bg-background text-foreground",
  white: "bg-card text-foreground",
  navy: "bg-navy text-ivory",
};

/**
 * Page section with the brand hairlines: gold rules on navy, navy rules on
 * light backgrounds.
 */
export const Section = ({
  tone = "light",
  rules = "both",
  className,
  children,
  ...props
}: SectionProps) => {
  const rule = tone === "navy" ? "section-rule-gold" : "section-rule";
  return (
    <section
      className={cn("relative scroll-mt-24 py-24 md:py-32", toneClasses[tone], className)}
      {...props}
    >
      {(rules === "both" || rules === "top") && (
        <span aria-hidden className={cn(rule, "top-8 md:top-10")} />
      )}
      {children}
      {(rules === "both" || rules === "bottom") && (
        <span aria-hidden className={cn(rule, "bottom-8 md:bottom-10")} />
      )}
    </section>
  );
};

/** Accent before eyebrow labels: a defined 1.5px line ending in a small dot. */
export const EyebrowMark = () => (
  <span aria-hidden className="flex shrink-0 items-center gap-1">
    <span className="h-[1.5px] w-9 bg-current" />
    <span className="size-[5px] rounded-full bg-current" />
  </span>
);

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** "navy" when the heading sits on a navy panel. */
  tone?: "light" | "navy";
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  tone = "light",
  align = "left",
  className,
  as: Title = "h2",
}: SectionHeadingProps) => (
  <div
    className={cn(
      "max-w-2xl",
      align === "center" && "mx-auto text-center",
      className
    )}
  >
    <p
      className={cn(
        "eyebrow mb-5 flex items-center gap-4",
        align === "center" && "justify-center",
        tone === "navy" ? "text-gold" : "text-ocean dark:text-gold"
      )}
    >
      <EyebrowMark />
      {eyebrow}
    </p>
    <Title
      className={cn(
        "display-title text-5xl md:text-6xl",
        tone === "navy" ? "text-gold" : "text-navy dark:text-ivory"
      )}
    >
      {title}
    </Title>
    {description && (
      <p
        className={cn(
          "mt-6 text-lg",
          tone === "navy" ? "text-gold-light" : "text-muted-foreground"
        )}
      >
        {description}
      </p>
    )}
  </div>
);
