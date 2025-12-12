import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import DonorRegistration from "@/pages/DonorRegistration";
import RequestBlood from "@/pages/RequestBlood";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPanel from "@/pages/AdminPanel";
import DonorTracker from "@/pages/DonorTracker";
import RequestManager from "@/pages/RequestManager";
import CaseLog from "@/pages/CaseLog";
import NotFound from "@/pages/not-found";

function PublicRouter() {
  return (
    <Switch>
      <Route path="/home" component={Home} />
      {/* <Route path="/" component={Home} /> */}
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
    <ProtectedRoute allowedRoles={["admin"]}>
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
                <Route path="/admin/" component={AdminDashboard} />
                <Route path="/admin/panel" component={AdminPanel} />
                <Route path="/admin/donors" component={DonorTracker} />
                <Route path="/admin/requests" component={RequestManager} />
                <Route path="/admin/case-log" component={CaseLog} />
                <Route path="/admin/stats" component={AdminDashboard} />
                <Route path="/admin/:rest*" component={NotFound} />
              </Switch>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={Login} />
      <Route path="/admin/:rest*">
        {() => <AdminRouter />}
      </Route>
      <Route path="/admin">
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
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
