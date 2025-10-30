import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "available" | "low" | "urgent" | "pending" | "approved" | "rejected" | "in_progress" | "completed" | "cancelled";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    available: {
      label: "Available",
      icon: CheckCircle2,
      className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    },
    low: {
      label: "Low",
      icon: AlertCircle,
      className: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    },
    urgent: {
      label: "Urgent",
      icon: AlertCircle,
      className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    },
    pending: {
      label: "Pending",
      icon: Clock,
      className: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    },
    approved: {
      label: "Approved",
      icon: CheckCircle2,
      className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    },
    rejected: {
      label: "Rejected",
      icon: AlertCircle,
      className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    },
    in_progress: {
      label: "In Progress",
      icon: Clock,
      className: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    },
    cancelled: {
      label: "Cancelled",
      icon: AlertCircle,
      className: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    },
  };

  const { label, icon: Icon, className: badgeClassName } = config[status];

  return (
    <Badge
      variant="outline"
      className={cn("border font-medium gap-1", badgeClassName, className)}
      data-testid={`badge-status-${status}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}
