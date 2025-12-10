import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Droplet, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
    const [location, setLocation] = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();

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

    const isActive = (path: string) => location === path;

    return (
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Desktop Navigation */}
                    <div className="flex items-center">
                        <Link href="/">
                            <a className="flex items-center">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Droplet className="h-6 w-6 text-red-600" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-900">BloodConnect</span>
                                </div>
                            </a>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:ml-8 md:flex md:space-x-4">
                            {navigation.map((item) => (
                                <Link key={item.name} href={item.href}>
                                    <a
                                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                                            ? "text-red-600 bg-red-50"
                                            : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                                            }`}
                                    >
                                        {item.name}
                                    </a>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side - Auth buttons */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated && user ? (
                            <>
                                {user.role === "admin" && (
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
                                                <p className="text-sm font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    Role: {user.role}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {user.role === "admin" && (
                                            <>
                                                <DropdownMenuItem onClick={() => setLocation("/admin")}>
                                                    Admin Panel
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                            </>
                                        )}
                                        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
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
                        {navigation.map((item) => (
                            <Link key={item.name} href={item.href}>
                                <a
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.href)
                                        ? "text-red-600 bg-red-50"
                                        : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                                        }`}
                                >
                                    {item.name}
                                </a>
                            </Link>
                        ))}
                        {isAuthenticated && user ? (
                            <>
                                {user.role === "admin" && (
                                    <button
                                        onClick={() => {
                                            setLocation("/admin");
                                            setMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                                    >
                                        Admin Panel
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </>
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
