import { cn } from "@/lib/utils";

interface BloodGroupBadgeProps {
  bloodGroup: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BloodGroupBadge({ bloodGroup, size = "md", className }: BloodGroupBadgeProps) {
  const sizeClasses = {
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-base",
    lg: "w-20 h-20 text-lg",
  };

  return (
    <div
      className={cn(
        "rounded-full border-2 border-primary flex items-center justify-center font-bold text-primary bg-card",
        sizeClasses[size],
        className
      )}
      data-testid={`badge-bloodgroup-${bloodGroup}`}
    >
      {bloodGroup}
    </div>
  );
}
