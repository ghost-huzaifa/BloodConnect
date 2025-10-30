import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BloodGroupBadge } from "@/components/BloodGroupBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { EligibilityIndicator } from "@/components/EligibilityIndicator";
import { Search, Phone, MessageCircle, CheckCircle, XCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Donor } from "@shared/schema";

const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const APPROVAL_STATUS = ["All", "pending", "approved", "rejected"];

export default function DonorTracker() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All");
  const [approvalFilter, setApprovalFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("");

  const { data: donors, isLoading } = useQuery<Donor[]>({
    queryKey: ["/api/donors"],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      return await apiRequest("PATCH", `/api/donors/${id}/approval`, { approvalStatus: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donors"] });
      toast({
        title: "Success",
        description: "Donor status updated successfully",
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

  const exportToExcel = () => {
    // Simple CSV export
    if (!donors || donors.length === 0) {
      toast({
        title: "No Data",
        description: "No donors to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Name", "Email", "Phone", "Blood Group", "City", "Batch", "Last Donation", "Status"];
    const rows = donors.map((donor) => [
      donor.name,
      donor.email,
      donor.phone,
      donor.bloodGroup,
      donor.city,
      donor.batch || "",
      donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : "Never",
      donor.approvalStatus,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donors-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Donors exported to CSV successfully",
    });
  };

  const calculateDaysSinceLastDonation = (lastDonationDate: Date | null): number | null => {
    if (!lastDonationDate) return null;
    const now = new Date();
    const lastDonation = new Date(lastDonationDate);
    const diffTime = Math.abs(now.getTime() - lastDonation.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredDonors = donors?.filter((donor) => {
    const matchesSearch =
      donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.phone.includes(searchQuery);
    const matchesBloodGroup = bloodGroupFilter === "All" || donor.bloodGroup === bloodGroupFilter;
    const matchesApproval = approvalFilter === "All" || donor.approvalStatus === approvalFilter;
    const matchesCity = !cityFilter || donor.city.toLowerCase().includes(cityFilter.toLowerCase());
    return matchesSearch && matchesBloodGroup && matchesApproval && matchesCity;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Donor Tracker</h1>
          <p className="text-muted-foreground mt-1">Manage donor registrations and approvals</p>
        </div>
        <Button onClick={exportToExcel} variant="outline" data-testid="button-export">
          <Download className="w-4 h-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone"
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
            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger data-testid="select-approval-filter">
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent>
                {APPROVAL_STATUS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "All" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by city"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              data-testid="input-city-filter"
            />
          </div>
        </CardContent>
      </Card>

      {/* Donors Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="mt-4 text-muted-foreground">Loading donors...</p>
            </div>
          ) : filteredDonors && filteredDonors.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Eligibility</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonors.map((donor) => (
                    <TableRow key={donor.id} className="hover-elevate" data-testid={`row-donor-${donor.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{donor.name}</p>
                          <p className="text-sm text-muted-foreground">{donor.email}</p>
                          {donor.batch && (
                            <Badge variant="outline" className="mt-1">
                              Batch {donor.batch}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <BloodGroupBadge bloodGroup={donor.bloodGroup} size="sm" />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
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
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{donor.city}</p>
                      </TableCell>
                      <TableCell>
                        <EligibilityIndicator
                          daysSinceLastDonation={calculateDaysSinceLastDonation(donor.lastDonationDate)}
                        />
                        {donor.lastDonationDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(donor.lastDonationDate), { addSuffix: true })}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={donor.approvalStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        {donor.approvalStatus === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveMutation.mutate({ id: donor.id, status: "approved" })}
                              disabled={approveMutation.isPending}
                              data-testid={`button-approve-${donor.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveMutation.mutate({ id: donor.id, status: "rejected" })}
                              disabled={approveMutation.isPending}
                              data-testid={`button-reject-${donor.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No donors found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
