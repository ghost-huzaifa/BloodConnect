import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BloodAvailabilityCard } from "@/components/BloodAvailabilityCard";
import { ActiveRequestCard } from "@/components/ActiveRequestCard";
import { Droplet, Users, Heart, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { BloodInventory, BloodRequest, PublicStats } from "@/types";
import DonorRegistration from "@/pages/DonorRegistration";
import RequestBlood from "@/pages/RequestBlood";
import { AppDialog } from "@/components/shared/AppDialog";
import { useUiDialogs } from "@/lib/ui-dialogs";
import { useAuth } from "@/lib/auth";

import { BloodGroup } from "@/types";
import { BLOOD_GROUPS, bloodGroupDisplay } from "@/lib/enum-utils";

const BLOOD_GROUP_DISPLAY = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function Home() {
  const [, setLocation] = useLocation();
  const {
    showDonorModal,
    showRequestModal,
    openDonorModal,
    openRequestModal,
    closeDonorModal,
    closeRequestModal,
  } = useUiDialogs();
  const { isAuthenticated } = useAuth();

  const { data: inventory, isLoading: inventoryLoading } = useQuery<BloodInventory[]>({
    queryKey: ["/api/blood-inventory"],
  });

  const { data: activeRequests, isLoading: requestsLoading } = useQuery<BloodRequest[]>({
    queryKey: ["/api/blood-requests/active"],
  });

  const { data: stats } = useQuery<PublicStats>({
    queryKey: ["/api/stats/public"],
  });

  // Wire dialog close events from inner components
  useEffect(() => {
    const handleCloseDonor = () => closeDonorModal();
    const handleCloseRequest = () => closeRequestModal();

    window.addEventListener("close-register-donor", handleCloseDonor);
    window.addEventListener("close-request-blood", handleCloseRequest);

    return () => {
      window.removeEventListener("close-register-donor", handleCloseDonor);
      window.removeEventListener("close-request-blood", handleCloseRequest);
    };
  }, [closeDonorModal, closeRequestModal]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              Save Lives Through <span className="text-primary">Blood Donation</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Join PIEAS Blood Chapter - connecting donors with those in need.
              Every drop counts in our mission to save lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                data-testid="button-register-donor"
                onClick={() => {
                  if (!isAuthenticated) {
                    setLocation("/login");
                    return;
                  }
                  openDonorModal();
                }}
              >
                <Users className="w-5 h-5 mr-2" />
                Register as Donor
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                data-testid="button-request-blood"
                onClick={openRequestModal}
              >
                <Droplet className="w-5 h-5 mr-2" />
                Request Blood
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              <Card className="bg-card/80 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-total-donors">{stats.totalDonors}</p>
                  <p className="text-sm text-muted-foreground">Registered Donors</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-total-donations">{stats.totalDonations}</p>
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <Droplet className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-active-requests">{stats.activeRequests}</p>
                  <p className="text-sm text-muted-foreground">Active Requests</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-completed-requests">{stats.completedRequests}</p>
                  <p className="text-sm text-muted-foreground">Lives Saved</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Blood Availability Section */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Blood Availability</h2>
            <p className="text-muted-foreground">Live status of available blood groups</p>
          </div>

          {inventoryLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {BLOOD_GROUP_DISPLAY.map((group) => (
                <Card key={group} className="animate-pulse">
                  <CardContent className="p-6 h-40" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {BLOOD_GROUPS.map((group) => {
                const item = inventory?.find((inv) => inv.bloodGroup === group);
                const displayGroup = bloodGroupDisplay[group];
                return (
                  <BloodAvailabilityCard
                    key={group}
                    bloodGroup={displayGroup}
                    unitsAvailable={item?.unitsAvailable || 0}
                    status={(item?.status as "available" | "low" | "urgent") || "available"}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Active Requests Section */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Urgent Blood Requests</h2>
            <p className="text-muted-foreground">People who need your help right now</p>
          </div>

          {requestsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 h-64" />
                </Card>
              ))}
            </div>
          ) : activeRequests && activeRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRequests.slice(0, 6).map((request) => (
                <ActiveRequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Active Requests</h3>
                <p className="text-muted-foreground">There are currently no urgent blood requests. Thank you for your support!</p>
              </CardContent>
            </Card>
          )}

          {activeRequests && activeRequests.length > 6 && (
            <div className="text-center mt-8">
              <Link href="/request-blood">
                <Button variant="outline" data-testid="button-view-all-requests">
                  View All Requests
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our community of life-savers. Register today and be notified when your blood type is needed.
          </p>
          <Button
            size="lg"
            data-testid="button-join-now"
            onClick={() => {
              if (!isAuthenticated) {
                setLocation("/login");
                return;
              }
              openDonorModal();
            }}
          >
            <Heart className="w-5 h-5 mr-2" />
            Join Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">PIEAS Blood Chapter</p>
            <p>Connecting donors with those in need • Saving lives one donation at a time</p>
            <p className="mt-4"> 2024 PIEAS Blood Chapter. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Donor Registration Modal */}
      <AppDialog open={showDonorModal} onOpenChange={(open) => (open ? openDonorModal() : closeDonorModal())}>
        <DonorRegistration variant="dialog" />
      </AppDialog>

      {/* Blood Request Modal */}
      <AppDialog open={showRequestModal} onOpenChange={(open) => (open ? openRequestModal() : closeRequestModal())}>
        <RequestBlood variant="dialog" />
      </AppDialog>
    </div>
  );
}
