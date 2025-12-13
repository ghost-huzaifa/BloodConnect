import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertDonorSchema, type InsertDonor } from "@shared/schema";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

interface DonorRegistrationProps {
  variant?: "page" | "dialog";
}

export default function DonorRegistration({ variant = "page" }: DonorRegistrationProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [phoneCode, setPhoneCode] = useState("+92");
  const [whatsappCode, setWhatsappCode] = useState("+92");

  const validateLocalPhone = (code: string, local: string) => {
    const digits = (local || "").replace(/\D/g, "");
    if (!digits) return "Phone number is required";
    switch (code) {
      case "+92":
        return digits.length === 10 || digits.length === 11 || "Enter a valid Pakistani number";
      case "+91":
        return digits.length === 10 || "Enter a valid Indian number";
      case "+1":
        return digits.length === 10 || "Enter a valid US number";
      default:
        return digits.length >= 7 || "Enter a valid phone number";
    }
  };

  const form = useForm<InsertDonor>({
    resolver: zodResolver(insertDonorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      bloodGroup: undefined,
      city: "",
      batch: "",
      whatsappNumber: "",
      lastDonationDate: undefined,
      approvalStatus: "pending",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertDonor) => {
      return await apiRequest("POST", "/api/donors", data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Registration Submitted!",
        description: "Your registration is pending admin approval. We'll notify you once approved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertDonor) => {
    const phoneDigits = (data.phone || "").replace(/\D/g, "");
    data.phone = phoneDigits ? `${phoneCode} ${phoneDigits}` : data.phone;

    if (data.whatsappNumber) {
      const whatsappDigits = data.whatsappNumber.replace(/\D/g, "");
      data.whatsappNumber = whatsappDigits ? `${whatsappCode} ${whatsappDigits}` : data.whatsappNumber;
    }

    registerMutation.mutate(data);
  };

  if (isSuccess) {
    const content = (
      <Card className="max-w-md w-full">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Registration Submitted!</h2>
            <p className="text-muted-foreground">
              Thank you for registering as a blood donor. Your application is pending admin approval.
              We'll contact you once your registration is approved.
            </p>
          </div>
          <div className="pt-4 space-y-3">
            {variant === "dialog" ? (
              <Button
                className="w-full"
                data-testid="button-close-dialog"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("close-register-donor"));
                }}
              >
                Close
              </Button>
            ) : (
              <Link href="/">
                <Button className="w-full" data-testid="button-back-home">
                  Back to Home
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );

    if (variant === "dialog") {
      return <div className="flex items-center justify-center p-2">{content}</div>;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-20">
        {content}
      </div>
    );
  }

  return (
    <div className={variant === "dialog" ? "" : "min-h-screen bg-background pt-8"}>
      {/* Header only in full page mode */}
      {variant === "page" && (
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </header>
      )}

      {/* Form Section */}
      <div className={variant === "dialog" ? "max-w-2xl mx-auto" : "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12"}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Register as Blood Donor</CardTitle>
            <CardDescription>
              Fill out the form below to register as a blood donor. Your registration will be reviewed by our admin team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    rules={{
                      validate: (value: string | undefined) => validateLocalPhone(phoneCode, value || ""),
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Select value={phoneCode} onValueChange={setPhoneCode}>
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="+92" className="text-foreground">+92</SelectItem>
                                <SelectItem value="+91" className="text-foreground">+91</SelectItem>
                                <SelectItem value="+1" className="text-foreground">+1</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="300 1234567"
                              {...field}
                              value={field.value || ""}
                              data-testid="input-phone"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Group *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-bloodgroup">
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BLOOD_GROUPS.map((group) => (
                              <SelectItem
                                key={group}
                                value={group}
                                className="text-foreground"
                              >
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="Islamabad" {...field} data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="batch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 2024"
                            {...field}
                            value={field.value ?? ""}
                            data-testid="input-batch"
                          />
                        </FormControl>
                        <FormDescription>Your graduation year or batch</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    rules={{
                      validate: (value) => {
                        const val = value as string | undefined;
                        if (!val) return true;
                        const digits = val.replace(/\D/g, "");
                        if (!digits) return true;
                        return validateLocalPhone(whatsappCode, val as string);
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Select value={whatsappCode} onValueChange={setWhatsappCode}>
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="+92" className="text-foreground">+92</SelectItem>
                                <SelectItem value="+91" className="text-foreground">+91</SelectItem>
                                <SelectItem value="+1" className="text-foreground">+1</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="300 1234567"
                              {...field}
                              value={field.value || ""}
                              data-testid="input-whatsapp"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>For quick contact</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="lastDonationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Donation Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-last-donation"
                        />
                      </FormControl>
                      <FormDescription>If you have donated before</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                    data-testid="button-submit-registration"
                  >
                    {registerMutation.isPending ? "Submitting..." : "Register as Donor"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
