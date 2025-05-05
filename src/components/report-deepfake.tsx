
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react'; // Keep Loader2 for animation
import { useToast } from "@/hooks/use-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Pixelated SVG Icons ---

// Pixelated AlertTriangle Icon
const PixelAlertTriangleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M2 20h20L12 4 2 20zm10-12v4m0 4v2" />
  </svg>
);

// Pixelated Send Icon
const PixelSendIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M2 22l11-11L2 0l20 11L2 22zM2 11h11" />
  </svg>
);

// Zod schema remains the same
const reportSchema = z.object({
  sourceUrl: z.string().url({ message: "Please enter a valid URL (e.g., https://...)." }).optional().or(z.literal('')),
  details: z.string().min(10, { message: "Please provide at least 10 characters." }).max(2000, { message: "Details limited to 2000 characters." }),
  contactEmail: z.string().email({ message: "Please enter a valid email format." }).optional().or(z.literal('')),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function ReportDeepfake() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      sourceUrl: "",
      details: "",
      contactEmail: "",
    },
  });

  const onSubmit: SubmitHandler<ReportFormValues> = async (data) => {
    setIsSubmitting(true);
    console.log("Submitting Report:", data); // Log data for debugging

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Replace with actual API endpoint call, e.g.:
      // const response = await fetch('/api/report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // if (!response.ok) {
      //   throw new Error('Failed to submit report.');
      // }

      toast({
        title: "Report Submitted Successfully",
        description: "Thank you for your contribution. Your report is being reviewed.",
        variant: 'default', // Use default (greenish in theme) for success
      });
      form.reset(); // Clear form on success
    } catch (error) {
      console.error("Report submission failed:", error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Could not submit the report. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <Card className="w-full border-destructive">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-destructive">
             <PixelAlertTriangleIcon /> Report Suspected Deepfake
          </CardTitle>
          <CardDescription>
            Help combat harmful deepfakes. Provide details about content you believe is malicious or misleading.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="sourceUrl"
                render={({ field }) => (
                  <FormItem>
                     <Tooltip>
                       <TooltipTrigger asChild>
                          <FormLabel htmlFor="sourceUrl" className="cursor-help">Source URL (Optional)</FormLabel>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Link to the website, social media post, etc., where you found the content.</p>
                       </TooltipContent>
                     </Tooltip>
                    <FormControl>
                      <Input
                        id="sourceUrl"
                        placeholder="https://example.com/path/to/content"
                        {...field}
                        className="bg-input"
                        aria-invalid={!!form.formState.errors.sourceUrl}
                        aria-describedby="sourceUrl-description sourceUrl-error"
                      />
                    </FormControl>
                    <FormDescription id="sourceUrl-description">
                      Providing the source helps us investigate.
                    </FormDescription>
                    <FormMessage id="sourceUrl-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <Tooltip>
                       <TooltipTrigger asChild>
                         <FormLabel htmlFor="details" className="cursor-help">Details *</FormLabel>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Describe why you suspect it's a deepfake and any harm it might cause.</p>
                       </TooltipContent>
                     </Tooltip>
                    <FormControl>
                      <Textarea
                        id="details"
                        placeholder="Explain the suspicious elements (e.g., unnatural face, voice doesn't match) and potential impact..."
                        rows={5}
                        {...field}
                         className="bg-input"
                         required // Add HTML5 required attribute
                         aria-required="true"
                         aria-invalid={!!form.formState.errors.details}
                         aria-describedby="details-description details-error"
                      />
                    </FormControl>
                     <FormDescription id="details-description">
                      Be specific (min. 10 characters).
                    </FormDescription>
                    <FormMessage id="details-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                     <Tooltip>
                       <TooltipTrigger asChild>
                          <FormLabel htmlFor="contactEmail" className="cursor-help">Your Email (Optional)</FormLabel>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Provide if you're willing to be contacted for more details. It won't be shared publicly.</p>
                       </TooltipContent>
                     </Tooltip>
                    <FormControl>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                         className="bg-input"
                         aria-invalid={!!form.formState.errors.contactEmail}
                         aria-describedby="contactEmail-description contactEmail-error"
                      />
                    </FormControl>
                    <FormDescription id="contactEmail-description">
                      Needed only if follow-up is required.
                    </FormDescription>
                    <FormMessage id="contactEmail-error" />
                  </FormItem>
                )}
              />

               <Tooltip>
                 <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                      variant="default" // Primary/Green button
                      aria-live="polite" // Announce loading state changes
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin mr-2" /> Submitting...
                        </>
                      ) : (
                        <>
                          <PixelSendIcon /> Submit Report
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Send your report for review.</p>
                   </TooltipContent>
                </Tooltip>
            </form>
          </Form>
           <p className="text-xs text-muted-foreground mt-6 border-t border-border pt-4">
               <strong>Disclaimer:</strong> Reporting helps raise awareness but doesn't guarantee content removal. Please also use platform-specific reporting tools (e.g., on social media sites) where applicable. This tool is for analysis and informational purposes.
            </p>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

    