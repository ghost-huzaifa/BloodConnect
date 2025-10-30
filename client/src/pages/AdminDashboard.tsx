import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Droplet, Heart, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<{
    totalDonors: number;
    approvedDonors: number;
    pendingDonors: number;
    totalRequests: number;
    activeRequests: number;
    completedRequests: number;
    totalDonations: number;
    todayDonations: number;
  }>({
    queryKey: ["/api/stats/admin"],
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of blood donation activities</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Donors</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-total-donors">
              {stats?.totalDonors || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.approvedDonors || 0} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-pending-donors">
              {stats?.pendingDonors || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Donors awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Requests</CardTitle>
            <Droplet className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-active-requests">
              {stats?.activeRequests || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalRequests || 0} total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Donations</CardTitle>
            <Heart className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-total-donations">
              {stats?.totalDonations || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.todayDonations || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Requests</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-completed-requests">
              {stats?.completedRequests || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lives saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats?.totalRequests && stats.totalRequests > 0
                ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Request completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Use the sidebar to navigate to different sections:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Donor Tracker - Manage donor registrations and approvals</li>
            <li>Blood Requests - Review and manage blood requests</li>
            <li>Case Log - View donation history and close cases</li>
            <li>Statistics - View detailed analytics and reports</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
