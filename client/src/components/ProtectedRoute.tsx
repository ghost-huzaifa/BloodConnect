import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { UserRole } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: Array<UserRole>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const [, setLocation] = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!user) {
        setLocation("/login");
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Alert variant="destructive" className="max-w-md">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                        Access denied. You don't have permission to view this page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return <>{children}</>;
}
