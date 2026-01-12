import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AuthUser } from "@/types";

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => void;
    login: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);

    // Try to get user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem("user");
            }
        }
    }, []);

    // Verify user with backend
    const { data, isLoading } = useQuery<AuthUser>({
        queryKey: ["/api/auth/me"],
        retry: false,
        enabled: !!user, // Only fetch if we have a local user
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Sync with backend data
    useEffect(() => {
        if (data) {
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
        }
    }, [data]);

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    const login = (newUser: AuthUser) => {
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                logout,
                login,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
