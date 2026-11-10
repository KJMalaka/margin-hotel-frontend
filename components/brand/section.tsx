import { cn } from "@/lib/utils";

type SectionTone = "light" | "white" | "navy";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  /** Top border line - use when two sections of the same tone meet. */
  divider?: boolean;
}

const toneClasses: Record<SectionTone, string> = {
  light: "bg-background text-foreground",
  white: "bg-card text-foreground",
  // .surface-brand swaps text, border and focus-ring tokens for navy.
  navy: "surface-brand",
};

/** Page section with consistent vertical rhythm (see --space-section). */
export const Section = ({
  tone = "light",
  divider = false,
  className,
  children,
  ...props
}: SectionProps) => (
  <section
    className={cn(
      "section-y relative",
      toneClasses[tone],
      divider && "border-t border-border",
      className
    )}
    {...props}
  >
    {children}
  </section>
);

/** Short accent line before eyebrow labels. */
export const EyebrowMark = () => (
  <span aria-hidden className="h-0.5 w-8 shrink-0 rounded-full bg-current" />
);

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** "navy" when the heading sits on a navy surface. */
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
        "eyebrow mb-3 flex items-center gap-3",
        align === "center" && "justify-center",
        tone === "navy" && "text-brand-gold"
      )}
    >
      <EyebrowMark />
      {eyebrow}
    </p>
    <Title
      className={cn(
        "display-title",
        tone === "navy" && "text-brand-foreground"
      )}
    >
      {title}
    </Title>
    {description && (
      <p
        className={cn(
          "measure mt-4 text-lg",
          align === "center" && "mx-auto",
          tone === "navy" ? "text-brand-foreground/90" : "text-muted-foreground"
        )}
      >
        {description}
      </p>
    )}
  </div>
);
