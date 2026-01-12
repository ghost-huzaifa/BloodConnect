import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Droplet, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useUiDialogs } from "@/lib/ui-dialogs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserRole } from "@/types";

export function Navbar() {
    const [location, setLocation] = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const { openDonorModal, openRequestModal } = useUiDialogs();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        logout();
        setLocation("/login");
    };

    const navigation = [
        { name: "Home", href: "/" },
        { name: "Register as Donor", href: "/register-donor" },
        { name: "Request Blood", href: "/request-blood" },
    ];

    const adminNavigation = [
        { name: "Dashboard", href: "/admin" },
        { name: "Donor Tracker", href: "/admin/donors" },
        { name: "Blood Requests", href: "/admin/requests" },
        { name: "Case Log", href: "/admin/case-log" },
        { name: "Statistics", href: "/admin/stats" },
    ];

    const isActive = (path: string) => location === path;
    const isAdminRoute = location.startsWith("/admin");

    // If an admin is authenticated on the login route, push them to the admin dashboard
    useEffect(() => {
        if (isAuthenticated && user?.role === UserRole.ADMIN && location === "/login") {
            setLocation("/admin");
        }
    }, [isAuthenticated, user, location, setLocation]);

    return (
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Desktop Navigation */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Droplet className="h-6 w-6 text-red-600" />
                                </div>
                                <span className="text-xl font-bold text-gray-900">BloodConnect</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:ml-8 md:flex md:space-x-4">
                            {/* On admin routes (for admin users), show only admin menu */}
                            {isAuthenticated && user?.role === UserRole.ADMIN && isAdminRoute
                                ? adminNavigation.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => setLocation(item.href)}
                                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                                            ? "text-red-600 bg-red-50"
                                            : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                                            }`}
                                    >
                                        {item.name}
                                    </button>
                                ))
                                : navigation.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => {
                                            if (item.href === "/register-donor") {
                                                if (!isAuthenticated) {
                                                    setLocation("/login");
                                                    return;
                                                }
                                                if (location !== "/") {
                                                    setLocation("/");
                                                }
                                                openDonorModal();
                                            } else if (item.href === "/request-blood") {
                                                if (location !== "/") {
                                                    setLocation("/");
                                                }
                                                openRequestModal();
                                            } else {
                                                setLocation(item.href);
                                            }
                                        }}
                                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                                            ? "text-red-600 bg-red-50"
                                            : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                                            }`}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Right side - Auth buttons */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated && user ? (
                            <>
                                {user.role === UserRole.ADMIN && !isAdminRoute && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setLocation("/admin")}
                                        className="hidden md:inline-flex"
                                    >
                                        Admin Panel
                                    </Button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                            <Avatar>
                                                <AvatarFallback className="bg-red-100 text-red-600">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium text-red-600 capitalize">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
        
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {user.role === UserRole.ADMIN && !isAdminRoute && (
                                            <>
                                                <DropdownMenuItem
                                                    onClick={() => setLocation("/admin")}
                                                    className="cursor-pointer text-foreground"
                                                >
                                                    Admin Panel
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                            </>
                                        )}
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="cursor-pointer text-foreground focus:text-red-600 focus:bg-red-50"
                                        >
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <div className="hidden md:flex md:items-center md:gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setLocation("/login")}
                                >
                                    Sign In
                                </Button>
                                <Button size="sm" onClick={() => setLocation("/register")}>
                                    Register
                                </Button>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {(isAuthenticated && user?.role === UserRole.ADMIN && isAdminRoute
                            ? adminNavigation
                            : navigation
                        ).map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.href)
                                    ? "text-red-600 bg-red-50"
                                    : "text-gray-700 hover:text-red-600 hover:bg-red-50"}`}
                            >
                                {item.name}
                            </Link>
                        ))}
                        {isAuthenticated && user ? (
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setLocation("/login");
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => {
                                        setLocation("/register");
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
