import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EligibilityIndicatorProps {
  daysSinceLastDonation: number | null;
  className?: string;
}

export function EligibilityIndicator({ daysSinceLastDonation, className }: EligibilityIndicatorProps) {
  const ELIGIBILITY_DAYS = 90;
  
  if (daysSinceLastDonation === null) {
    return (
      <Badge
        variant="outline"
        className={cn("bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 gap-1.5 font-medium", className)}
        data-testid="badge-eligibility-eligible"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Eligible
      </Badge>
    );
  }

  const isEligible = daysSinceLastDonation >= ELIGIBILITY_DAYS;
  const daysRemaining = ELIGIBILITY_DAYS - daysSinceLastDonation;

  if (isEligible) {
    return (
      <Badge
        variant="outline"
        className={cn("bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 gap-1.5 font-medium", className)}
        data-testid="badge-eligibility-eligible"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Eligible ({daysSinceLastDonation} days)
      </Badge>
    );
  }

  if (daysRemaining <= 14) {
    return (
      <Badge
        variant="outline"
        className={cn("bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 gap-1.5 font-medium", className)}
        data-testid="badge-eligibility-soon"
      >
        <Clock className="w-3.5 h-3.5" />
        {daysRemaining} days left
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn("bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 gap-1.5 font-medium", className)}
      data-testid="badge-eligibility-not-eligible"
    >
      <XCircle className="w-3.5 h-3.5" />
      Not Eligible ({daysRemaining} days)
    </Badge>
  );
}
