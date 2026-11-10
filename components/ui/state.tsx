import * as React from "react";
import { Inbox, LoaderCircle, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/** Shown while data loads. Announced politely to screen readers. */
export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-3 rounded-lg border border-dashed border-input bg-card px-4 py-10 text-muted-foreground",
        className
      )}
    >
      <LoaderCircle aria-hidden className="size-6 motion-safe:animate-spin" />
      <span>{label}</span>
    </div>
  );
}

/** Shown when a list or table has nothing in it. */
export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-input bg-card px-4 py-10 text-center",
        className
      )}
    >
      <Icon aria-hidden className="size-8 text-muted-foreground" />
      <p className="text-lg font-bold">{title}</p>
      {description && (
        <p className="measure text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}

/** Shown when loading fails. Offers a retry when one is given. */
export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <Alert variant="danger" title={title} className={className}>
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Alert>
  );
}
