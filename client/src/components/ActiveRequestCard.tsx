import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BloodGroupBadge } from "./BloodGroupBadge";
import { UrgencyBadge } from "./UrgencyBadge";
import { MapPin, Phone, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { BloodRequest } from "@shared/schema";

interface ActiveRequestCardProps {
  request: BloodRequest;
  onHelp?: () => void;
  className?: string;
}

export function ActiveRequestCard({ request, onHelp, className }: ActiveRequestCardProps) {
  return (
    <Card className={cn("hover-elevate", className)} data-testid={`card-request-${request.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <BloodGroupBadge bloodGroup={request.bloodGroup} size="sm" />
            <div>
              <CardTitle className="text-lg">{request.patientName}</CardTitle>
              <p className="text-sm text-muted-foreground">{request.hospitalName}</p>
            </div>
          </div>
          <UrgencyBadge urgency={request.urgencyLevel} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{request.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{request.unitsNeeded} {request.unitsNeeded === 1 ? "unit" : "units"} needed</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>{request.contactPerson} - {request.contactPhone}</span>
        </div>
      </CardContent>
      {onHelp && (
        <CardFooter className="pt-3">
          <Button onClick={onHelp} className="w-full" data-testid={`button-help-${request.id}`}>
            I Can Help
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
