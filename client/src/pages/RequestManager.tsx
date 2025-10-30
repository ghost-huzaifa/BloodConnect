import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BloodGroupBadge } from "@/components/BloodGroupBadge";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, CheckCircle, XCircle, Users, MapPin, Phone, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { BloodRequest, Donor } from "@shared/schema";

const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function RequestManager() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showMatchingDonors, setShowMatchingDonors] = useState(false);

  const { data: requests, isLoading } = useQuery<BloodRequest[]>({
    queryKey: ["/api/blood-requests"],
  });

  const { data: matchingDonors } = useQuery<Donor[]>({
    queryKey: ["/api/donors/matching", selectedRequest?.id],
    enabled: !!selectedRequest && showMatchingDonors,
  });

  const approveRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      return await apiRequest("PATCH", `/api/blood-requests/${id}/approval`, { approvalStatus: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blood-requests"] });
      toast({
        title: "Success",
        description: "Request status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "in_progress" | "completed" | "cancelled" }) => {
      return await apiRequest("PATCH", `/api/blood-requests/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blood-requests"] });
      toast({
        title: "Success",
        description: "Request status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredRequests = requests?.filter((request) => {
    const matchesSearch =
      request.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBloodGroup = bloodGroupFilter === "All" || request.bloodGroup === bloodGroupFilter;
    return matchesSearch && matchesBloodGroup;
  });

  const pendingRequests = filteredRequests?.filter((r) => r.status === "pending" && r.approvalStatus === "approved");
  const inProgressRequests = filteredRequests?.filter((r) => r.status === "in_progress");
  const completedRequests = filteredRequests?.filter((r) => r.status === "completed");
  const awaitingApprovalRequests = filteredRequests?.filter((r) => r.approvalStatus === "pending");

  const RequestCard = ({ request }: { request: BloodRequest }) => (
    <Card className="hover-elevate" data-testid={`card-request-${request.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <BloodGroupBadge bloodGroup={request.bloodGroup} size="md" />
            <div>
              <h3 className="font-semibold text-foreground text-lg">{request.patientName}</h3>
              <p className="text-sm text-muted-foreground">{request.hospitalName}</p>
            </div>
          </div>
          <UrgencyBadge urgency={request.urgencyLevel} />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {request.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {request.unitsNeeded} {request.unitsNeeded === 1 ? "unit" : "units"} needed
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            {request.contactPerson} - {request.contactPhone}
          </div>
          {request.contactWhatsapp && (
            <a
              href={`https://wa.me/${request.contactWhatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-green-600 hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              Contact on WhatsApp
            </a>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </p>
          <div className="flex gap-2">
            {request.approvalStatus === "pending" ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => approveRequestMutation.mutate({ id: request.id, status: "approved" })}
                  disabled={approveRequestMutation.isPending}
                  data-testid={`button-approve-request-${request.id}`}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => approveRequestMutation.mutate({ id: request.id, status: "rejected" })}
                  disabled={approveRequestMutation.isPending}
                  data-testid={`button-reject-request-${request.id}`}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </>
            ) : (
              <>
                {request.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: request.id, status: "in_progress" })}
                    disabled={updateStatusMutation.isPending}
                    data-testid={`button-start-${request.id}`}
                  >
                    Start Processing
                  </Button>
                )}
                {request.status === "in_progress" && (
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: request.id, status: "completed" })}
                    disabled={updateStatusMutation.isPending}
                    data-testid={`button-complete-${request.id}`}
                  >
                    Mark Complete
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowMatchingDonors(true);
                  }}
                  data-testid={`button-view-donors-${request.id}`}
                >
                  <Users className="w-4 h-4 mr-1" />
                  View Donors
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Blood Requests</h1>
        <p className="text-muted-foreground mt-1">Manage blood requests and match with donors</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient, hospital, or location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
              <SelectTrigger data-testid="select-blood-group-filter">
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group === "All" ? "All Blood Groups" : group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Tabs */}
      <Tabs defaultValue="approval" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="approval" data-testid="tab-approval">
            Awaiting Approval ({awaitingApprovalRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            New ({pendingRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="in-progress" data-testid="tab-in-progress">
            In Progress ({inProgressRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            Completed ({completedRequests?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approval" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 h-64" />
                </Card>
              ))}
            </div>
          ) : awaitingApprovalRequests && awaitingApprovalRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {awaitingApprovalRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No requests awaiting approval</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 h-64" />
                </Card>
              ))}
            </div>
          ) : pendingRequests && pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No new requests</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 h-64" />
                </Card>
              ))}
            </div>
          ) : inProgressRequests && inProgressRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {inProgressRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No requests in progress</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 h-64" />
                </Card>
              ))}
            </div>
          ) : completedRequests && completedRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No completed requests</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Matching Donors Dialog */}
      <Dialog open={showMatchingDonors} onOpenChange={setShowMatchingDonors}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Matching Donors</DialogTitle>
            <DialogDescription>
              Donors matching {selectedRequest?.bloodGroup} blood group in {selectedRequest?.location}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {matchingDonors && matchingDonors.length > 0 ? (
              matchingDonors.map((donor) => (
                <Card key={donor.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <BloodGroupBadge bloodGroup={donor.bloodGroup} size="sm" />
                        <div>
                          <p className="font-medium text-foreground">{donor.name}</p>
                          <p className="text-sm text-muted-foreground">{donor.city}</p>
                        </div>
                      </div>
                      <StatusBadge status={donor.approvalStatus} />
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3" />
                        {donor.phone}
                      </div>
                      {donor.whatsappNumber && (
                        <a
                          href={`https://wa.me/${donor.whatsappNumber.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-green-600 hover:underline"
                        >
                          <MessageCircle className="w-3 h-3" />
                          Contact on WhatsApp
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No matching donors found</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMatchingDonors(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
