import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PhoneNumberInput } from "@/components/shared/PhoneNumberInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Droplet, AlertCircle } from "lucide-react";
import { UserRole } from "@/types";

const registerFormSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	phone: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function Register() {
    const [, setLocation] = useLocation();
    const [error, setError] = useState<string>("");
    const [phoneCode, setPhoneCode] = useState("+92");

    const validateLocalPhone = (code: string, local: string) => {
        const digits = (local || "").replace(/\D/g, "");
        if (!digits) return true; // optional field
        switch (code) {
            case "+92":
                return digits.length === 10 || "Enter a valid Pakistani number";
            case "+91":
                return digits.length === 10 || "Enter a valid Indian number";
            case "+1":
                return digits.length === 10 || "Enter a valid US number";
            default:
                return digits.length >= 7 || "Enter a valid phone number";
        }
    };

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            phone: "",
        },
    });

    const registerMutation = useMutation({
        mutationFn: async (data: RegisterFormValues) => {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: data.password,
                    phoneNo: data.phone,
                }),
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Registration failed");
            }

            return response.json();
        },
        onSuccess: (data) => {
            // Store user info in localStorage
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect based on role
            if (data.user.role === UserRole.ADMIN) {
                setLocation("/admin");
            } else {
                setLocation("/");
            }
        },
        onError: (error: Error) => {
            setError(error.message);
        },
    });

    const onSubmit = (data: RegisterFormValues) => {
        setError("");
        if (data.phone) {
            const digits = data.phone.replace(/\D/g, "");
            data.phone = digits ? `${phoneCode} ${digits}` : data.phone;
        }
        registerMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-100 rounded-full">
                            <Droplet className="h-8 w-8 text-red-600" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold">Join BloodConnect</CardTitle>
                    <CardDescription>
                        Create an account to save lives
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="your.email@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                rules={{
                                    validate: (value) => validateLocalPhone(phoneCode, value as string),
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number (Optional)</FormLabel>
                                        <FormControl>
                                            <PhoneNumberInput
                                                code={phoneCode}
                                                onCodeChange={setPhoneCode}
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={registerMutation.isPending}
                            >
                                {registerMutation.isPending ? "Creating account..." : "Create Account"}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p>
                            Already have an account?{" "}
                            <button
                                onClick={() => setLocation("/login")}
                                className="text-red-600 hover:text-red-700 font-medium"
                            >
                                Sign in here
                            </button>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
