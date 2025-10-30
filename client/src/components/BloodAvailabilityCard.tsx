import { Card, CardContent } from "@/components/ui/card";
import { BloodGroupBadge } from "./BloodGroupBadge";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

interface BloodAvailabilityCardProps {
  bloodGroup: string;
  unitsAvailable: number;
  status: "available" | "low" | "urgent";
  className?: string;
}

export function BloodAvailabilityCard({
  bloodGroup,
  unitsAvailable,
  status,
  className,
}: BloodAvailabilityCardProps) {
  return (
    <Card className={cn("hover-elevate transition-all", className)} data-testid={`card-blood-${bloodGroup}`}>
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <BloodGroupBadge bloodGroup={bloodGroup} size="lg" />
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold text-foreground" data-testid={`text-units-${bloodGroup}`}>
            {unitsAvailable} {unitsAvailable === 1 ? "Unit" : "Units"}
          </p>
          <StatusBadge status={status} />
        </div>
      </CardContent>
    </Card>
  );
}
