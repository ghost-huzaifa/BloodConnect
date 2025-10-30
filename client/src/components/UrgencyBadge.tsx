import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UrgencyBadgeProps {
  urgency: "normal" | "urgent" | "emergency";
  showTime?: boolean;
  className?: string;
}

export function UrgencyBadge({ urgency, showTime = true, className }: UrgencyBadgeProps) {
  const config = {
    normal: {
      label: "Normal",
      time: "24 hrs",
      icon: Clock,
      className: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    },
    urgent: {
      label: "Urgent",
      time: "6 hrs",
      icon: AlertTriangle,
      className: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 animate-pulse",
    },
    emergency: {
      label: "Emergency",
      time: "Immediate",
      icon: AlertCircle,
      className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 animate-pulse",
    },
  };

  const { label, time, icon: Icon, className: badgeClassName } = config[urgency];

  return (
    <Badge
      variant="outline"
      className={cn("border font-semibold gap-1.5", badgeClassName, className)}
      data-testid={`badge-urgency-${urgency}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
      {showTime && <span className="text-xs">({time})</span>}
    </Badge>
  );
}
