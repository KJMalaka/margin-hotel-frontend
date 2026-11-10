import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleX,
  Clock,
  Info,
  type LucideIcon,
} from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";

type Tone = NonNullable<BadgeProps["variant"]>;

/* Status values from the API mapped to tone + icon. Unknown values fall back
   to a neutral badge, so new backend statuses still render readably. */
const STATUS_STYLES: Record<string, { tone: Tone; icon: LucideIcon }> = {
  CONFIRMED: { tone: "success", icon: CircleCheck },
  PAID: { tone: "success", icon: CircleCheck },
  SUCCESS: { tone: "success", icon: CircleCheck },
  SUCCESSFUL: { tone: "success", icon: CircleCheck },
  COMPLETED: { tone: "success", icon: CircleCheck },
  UPCOMING: { tone: "info", icon: Clock },
  CHECKED_IN: { tone: "success", icon: CircleCheck },
  CHECKED_OUT: { tone: "secondary", icon: CircleDashed },
  PENDING: { tone: "warning", icon: Clock },
  UNPAID: { tone: "warning", icon: Clock },
  ISSUED: { tone: "info", icon: Info },
  OVERDUE: { tone: "destructive", icon: CircleAlert },
  FAILED: { tone: "destructive", icon: CircleX },
  CANCELLED: { tone: "destructive", icon: CircleX },
  CANCELED: { tone: "destructive", icon: CircleX },
  REFUNDED: { tone: "secondary", icon: CircleDashed },
};

/** "CHECKED_IN" -> "Checked in" */
export function formatStatus(status: string) {
  const words = status.replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const style = STATUS_STYLES[status.toUpperCase()] ?? {
    tone: "secondary" as Tone,
    icon: Info,
  };
  const Icon = style.icon;

  return (
    <Badge variant={style.tone} className={className}>
      <Icon aria-hidden />
      {formatStatus(status)}
    </Badge>
  );
}
