import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "flex gap-3 rounded-md border-l-4 p-4 text-base [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        info: "border-info bg-info-bg text-foreground [&>svg]:text-info",
        success: "border-success bg-success-bg text-foreground [&>svg]:text-success",
        warning: "border-warning bg-warning-bg text-foreground [&>svg]:text-warning",
        danger: "border-danger bg-danger-bg text-foreground [&>svg]:text-danger",
      },
    },
    defaultVariants: { variant: "info" },
  }
);

const ICONS: Record<string, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

// Spoken before the message so the meaning never depends on colour or icon.
const PREFIX: Record<string, string> = {
  info: "Note:",
  success: "Success:",
  warning: "Warning:",
  danger: "Error:",
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
}

/** Inline message. Danger alerts are announced immediately (role="alert");
 *  the others politely (role="status"). */
function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  const tone = variant ?? "info";
  const Icon = ICONS[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ variant: tone }), className)}
      {...props}
    >
      <Icon aria-hidden />
      <div className="min-w-0 space-y-1">
        {title ? (
          <p className="font-bold">{title}</p>
        ) : (
          <span className="sr-only">{PREFIX[tone]} </span>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}

export { Alert, alertVariants };
