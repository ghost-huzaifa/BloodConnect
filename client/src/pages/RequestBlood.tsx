import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertBloodRequestSchema, type InsertBloodRequest } from "@shared/schema";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const URGENCY_LEVELS = [
  { value: "normal", label: "Normal (24 hrs)", description: "Standard blood request" },
  { value: "urgent", label: "Urgent (6 hrs)", description: "Blood needed within 6 hours" },
  { value: "emergency", label: "Emergency (Immediate)", description: "Critical - blood needed immediately" },
];

interface RequestBloodProps {
  variant?: "page" | "dialog";
}

export default function RequestBlood({ variant = "page" }: RequestBloodProps) {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [contactPhoneCode, setContactPhoneCode] = useState("+92");
  const [contactWhatsappCode, setContactWhatsappCode] = useState("+92");

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

  const form = useForm<InsertBloodRequest>({
    resolver: zodResolver(insertBloodRequestSchema),
    defaultValues: {
      patientName: "",
      bloodGroup: undefined,
      unitsNeeded: 1,
      urgencyLevel: "normal",
      location: "",
      hospitalName: "",
      contactPerson: "",
      contactPhone: "",
      contactWhatsapp: "",
      remarks: "",
      status: "pending",
      approvalStatus: "pending",
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (data: InsertBloodRequest) => {
      return await apiRequest("POST", "/api/blood-requests", data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Request Submitted!",
        description: "Your blood request is pending admin approval. We'll notify eligible donors once approved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBloodRequest) => {
    const phoneDigits = (data.contactPhone || "").replace(/\D/g, "");
    data.contactPhone = phoneDigits ? `${contactPhoneCode} ${phoneDigits}` : data.contactPhone;

    if (data.contactWhatsapp) {
      const whatsappDigits = data.contactWhatsapp.replace(/\D/g, "");
      data.contactWhatsapp = whatsappDigits ? `${contactWhatsappCode} ${whatsappDigits}` : data.contactWhatsapp;
    }

    requestMutation.mutate(data);
  };

  if (isSuccess) {
    const content = (
      <Card className="max-w-md w-full">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Request Submitted!</h2>
              <p className="text-muted-foreground">
                Your blood request has been submitted and is pending admin approval.
                Once approved, we'll notify eligible donors who can help.
              </p>
            </div>
            <div className="pt-4 space-y-3">
              {variant === "dialog" ? (
                <Button
                  className="w-full"
                  data-testid="button-close-dialog"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("close-request-blood"));
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
      {/* Header */}
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
            <CardTitle className="text-2xl">Request Blood</CardTitle>
            <CardDescription>
              Submit a blood request for a patient in need. Our system will automatically notify eligible donors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Patient Information</h3>

                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Patient full name" {...field} data-testid="input-patient-name" />
                        </FormControl>
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
                          <FormLabel>Blood Group Required *</FormLabel>
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
                      name="unitsNeeded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Units Needed *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              data-testid="input-units-needed"
                            />
                          </FormControl>
                          <FormDescription>Number of blood units required</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="urgencyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency Level *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-urgency">
                              <SelectValue placeholder="Select urgency level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {URGENCY_LEVELS.map((level) => (
                              <SelectItem
                                key={level.value}
                                value={level.value}
                                className="text-foreground"
                              >
                                <div>
                                  <div className="font-medium">{level.label}</div>
                                  <div className="text-xs text-muted-foreground">{level.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Hospital Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Hospital Information</h3>

                  <FormField
                    control={form.control}
                    name="hospitalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hospital Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Hospital or clinic name" {...field} data-testid="input-hospital" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location/Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="City and area" {...field} data-testid="input-location" />
                        </FormControl>
                        <FormDescription>Include city and specific area for easy location</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>

                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person *</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of person to contact" {...field} data-testid="input-contact-person" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      rules={{
                        validate: (value: string | undefined) => validateLocalPhone(contactPhoneCode, value || ""),
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone *</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Select value={contactPhoneCode} onValueChange={setContactPhoneCode}>
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
                                data-testid="input-contact-phone"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactWhatsapp"
                      rules={{
                        validate: (value: string | undefined) => {
                          if (!value) return true; // optional
                          const digits = value.replace(/\D/g, "");
                          if (!digits) return true; // treat as empty
                          return validateLocalPhone(contactWhatsappCode, value);
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Select value={contactWhatsappCode} onValueChange={setContactWhatsappCode}>
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
                                data-testid="input-contact-whatsapp"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>For quick contact</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Remarks (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information about the request"
                          className="resize-none"
                          rows={4}
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-remarks"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-300">
                      <p className="font-medium mb-1">Important Notice</p>
                      <p>Your request will be reviewed by our admin team before notifying donors.
                        This ensures all requests are legitimate and helps maintain trust in our community.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={requestMutation.isPending}
                    data-testid="button-submit-request"
                  >
                    {requestMutation.isPending ? "Submitting..." : "Submit Blood Request"}
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
