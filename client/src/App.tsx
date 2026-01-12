import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
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
import { UiDialogProvider } from "@/lib/ui-dialogs";
import { UserRole } from "@/types";

// Wrapper components for routes so we don't pass router props to dialog variants
const DonorRegistrationPage = () => <DonorRegistration />;
const RequestBloodPage = () => <RequestBlood />;

function PublicRouter() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/register-donor" component={DonorRegistrationPage} />
        <Route path="/request-blood" component={RequestBloodPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function AdminRouter() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <SidebarProvider style={style as React.CSSProperties}>
        <main className="min-h-screen bg-background">
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
      </SidebarProvider>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <>
      <UiDialogProvider>
        <Navbar />
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
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
      </UiDialogProvider>
    </>
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
