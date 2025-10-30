import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BloodGroupBadge } from "@/components/BloodGroupBadge";
import { Search, Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertDonationSchema, type InsertDonation, type Donation, type Donor, type BloodRequest } from "@shared/schema";

type DonationWithDetails = Donation & {
  donor: Donor;
  request: BloodRequest;
};

export default function CaseLog() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: donations, isLoading } = useQuery<DonationWithDetails[]>({
    queryKey: ["/api/donations"],
  });

  const { data: donors } = useQuery<Donor[]>({
    queryKey: ["/api/donors"],
    enabled: showAddDialog,
  });

  const { data: requests } = useQuery<BloodRequest[]>({
    queryKey: ["/api/blood-requests"],
    enabled: showAddDialog,
  });

  const form = useForm<InsertDonation>({
    resolver: zodResolver(insertDonationSchema),
    defaultValues: {
      donorId: "",
      requestId: "",
      donationDate: new Date(),
      unitsContributed: 1,
      remarks: "",
    },
  });

  const addDonationMutation = useMutation({
    mutationFn: async (data: InsertDonation) => {
      return await apiRequest("POST", "/api/donations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/admin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/public"] });
      setShowAddDialog(false);
      form.reset();
      toast({
        title: "Success",
        description: "Donation recorded successfully",
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
    if (!donations || donations.length === 0) {
      toast({
        title: "No Data",
        description: "No donations to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Date", "Donor", "Patient", "Blood Group", "Units", "Hospital", "Remarks"];
    const rows = donations.map((donation) => [
      format(new Date(donation.donationDate), "yyyy-MM-dd HH:mm"),
      donation.donor.name,
      donation.request.patientName,
      donation.donor.bloodGroup,
      donation.unitsContributed.toString(),
      donation.request.hospitalName,
      donation.remarks || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `case-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Case log exported to CSV successfully",
    });
  };

  const filteredDonations = donations?.filter((donation) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      donation.donor.name.toLowerCase().includes(searchLower) ||
      donation.request.patientName.toLowerCase().includes(searchLower) ||
      donation.request.hospitalName.toLowerCase().includes(searchLower)
    );
  });

  const onSubmit = (data: InsertDonation) => {
    addDonationMutation.mutate(data);
  };

  const approvedDonors = donors?.filter((d) => d.approvalStatus === "approved");
  const completedRequests = requests?.filter((r) => r.status === "completed" || r.status === "in_progress");

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Case Closure Log</h1>
          <p className="text-muted-foreground mt-1">Track completed donations and case closures</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-donation">
            <Plus className="w-4 h-4 mr-2" />
            Record Donation
          </Button>
          <Button onClick={exportToExcel} variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by donor, patient, or hospital"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="mt-4 text-muted-foreground">Loading donations...</p>
            </div>
          ) : filteredDonations && filteredDonations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map((donation) => (
                    <TableRow key={donation.id} className="hover-elevate" data-testid={`row-donation-${donation.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {format(new Date(donation.donationDate), "MMM dd, yyyy")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(donation.donationDate), "hh:mm a")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{donation.donor.name}</p>
                          <p className="text-sm text-muted-foreground">{donation.donor.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">{donation.request.patientName}</p>
                      </TableCell>
                      <TableCell>
                        <BloodGroupBadge bloodGroup={donation.donor.bloodGroup} size="sm" />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">{donation.unitsContributed}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{donation.request.hospitalName}</p>
                          <p className="text-sm text-muted-foreground">{donation.request.location}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {donation.remarks || "-"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No donations recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Donation Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Donation</DialogTitle>
            <DialogDescription>
              Record a completed blood donation to close a case
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="donorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Donor *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-donor">
                            <SelectValue placeholder="Select donor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {approvedDonors?.map((donor) => (
                            <SelectItem key={donor.id} value={donor.id}>
                              {donor.name} ({donor.bloodGroup}) - {donor.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requestId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Request *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-request">
                            <SelectValue placeholder="Select request" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {completedRequests?.map((request) => (
                            <SelectItem key={request.id} value={request.id}>
                              {request.patientName} ({request.bloodGroup}) - {request.hospitalName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="donationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Donation Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                          data-testid="input-donation-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitsContributed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units Contributed *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          data-testid="input-units"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about the donation"
                        className="resize-none"
                        rows={3}
                        {...field}
                        data-testid="input-remarks"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  disabled={addDonationMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addDonationMutation.isPending} data-testid="button-submit-donation">
                  {addDonationMutation.isPending ? "Recording..." : "Record Donation"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
