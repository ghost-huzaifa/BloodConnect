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
import { PhoneNumberInput } from "@/components/shared/PhoneNumberInput";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { BloodGroup } from "@/types";
import { BLOOD_GROUP_OPTIONS, bloodGroupDisplay } from "@/lib/enum-utils";
import { useAuth } from "@/lib/auth";
import { z } from "zod";

// Form validation schema
const donorFormSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  whatsappNumber: z.string().optional(),
  bloodGroup: z.nativeEnum(BloodGroup, { errorMap: () => ({ message: "Please select a blood group" }) }),
  city: z.string().min(2, "City is required"),
});

type DonorFormData = z.infer<typeof donorFormSchema>;

interface DonorRegistrationProps {
  variant?: "page" | "dialog";
}

export default function DonorRegistration({ variant = "page" }: DonorRegistrationProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
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

  const form = useForm<DonorFormData>({
    resolver: zodResolver(donorFormSchema),
    defaultValues: {
      phone: "",
      whatsappNumber: "",
      bloodGroup: undefined,
      city: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: DonorFormData) => {
      return await apiRequest("POST", "/api/donors/me", data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Registration Submitted!",
        description: "Your registration is pending admin approval. We'll notify you once approved.",
      });
    },
    onError: (error: Error) => {
      const message = error.message || "Registration failed";
      const lower = message.toLowerCase();

      if (lower.includes("already") && lower.includes("donor")) {
        toast({
          title: "Already registered as donor",
          description: "You are already registered as a blood donor.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registration failed",
        description: "Something went wrong while registering you as a donor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DonorFormData) => {
    const phoneDigits = (data.phone || "").replace(/\D/g, "");
    const phone = `${phoneCode} ${phoneDigits}`;

    let whatsappNumber = data.whatsappNumber;
    if (data.whatsappNumber) {
      const whatsappDigits = data.whatsappNumber.replace(/\D/g, "");
      whatsappNumber = whatsappDigits ? `${whatsappCode} ${whatsappDigits}` : undefined;
    }

    registerMutation.mutate({
      phone,
      whatsappNumber,
      bloodGroup: data.bloodGroup,
      city: data.city,
    });
  };

  if (!user) {
    navigate("/login");
    return null;
  }

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
                {/* Name/email/password are taken from the logged-in user, so we only ask for contact and donor-specific info here */}
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
                        <PhoneNumberInput
                          code={phoneCode}
                          onCodeChange={setPhoneCode}
                          value={field.value || ""}
                          onChange={field.onChange}
                          inputTestId="input-phone"
                        />
                      </FormControl>
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
                        <PhoneNumberInput
                          code={whatsappCode}
                          onCodeChange={setWhatsappCode}
                          value={field.value || ""}
                          onChange={field.onChange}
                          inputTestId="input-whatsapp"
                        />
                      </FormControl>
                      <FormDescription>For quick contact</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            {BLOOD_GROUP_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="text-foreground"
                              >
                                {option.label}
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
