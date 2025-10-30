import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import Home from "@/pages/Home";
import DonorRegistration from "@/pages/DonorRegistration";
import RequestBlood from "@/pages/RequestBlood";
import AdminDashboard from "@/pages/AdminDashboard";
import DonorTracker from "@/pages/DonorTracker";
import RequestManager from "@/pages/RequestManager";
import CaseLog from "@/pages/CaseLog";
import NotFound from "@/pages/not-found";

function PublicRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register-donor" component={DonorRegistration} />
      <Route path="/request-blood" component={RequestBlood} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminRouter() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-card">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h2 className="text-lg font-semibold text-foreground">PIEAS Blood Chapter Admin</h2>
          </header>
          <main className="flex-1 overflow-auto bg-background">
            <Switch>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/donors" component={DonorTracker} />
              <Route path="/admin/requests" component={RequestManager} />
              <Route path="/admin/case-log" component={CaseLog} />
              <Route path="/admin/stats" component={AdminDashboard} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/:rest*">
        {() => <AdminRouter />}
      </Route>
      <Route>
        {() => <PublicRouter />}
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
