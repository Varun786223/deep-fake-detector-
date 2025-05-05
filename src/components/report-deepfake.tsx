"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Send, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Define the pixelated Send icon using SVG
const PixelSendIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M2 22l11-11L2 0l20 11L2 22zM2 11h11" />
  </svg>
);


const reportSchema = z.object({
  sourceUrl: z.string().url({ message: "Please enter a valid URL where you found the content." }).optional().or(z.literal('')),
  details: z.string().min(10, { message: "Please provide at least 10 characters of detail." }).max(2000, { message: "Details cannot exceed 2000 characters." }),
  contactEmail: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
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
    console.log("Report Data:", data); // Placeholder for actual submission logic

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    toast({
      title: "Report Submitted",
      description: "Thank you for reporting. We will review the content.",
    });
    form.reset(); // Clear the form after successful submission
  };

  return (
    <Card className="w-full border-destructive shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2"><AlertTriangle /> Report Suspected Deepfake</CardTitle>
        <CardDescription>
          If you've encountered content you believe is a harmful deepfake, please provide details below.
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
                  <FormLabel htmlFor="sourceUrl">Source URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      id="sourceUrl"
                      placeholder="https://example.com/deepfake-video"
                      {...field}
                      className="bg-card"
                    />
                  </FormControl>
                  <FormDescription>
                    Where did you find this content? (e.g., link to social media post, website)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="details">Details *</FormLabel>
                  <FormControl>
                    <Textarea
                      id="details"
                      placeholder="Describe why you believe this is a deepfake and any potential harm it might cause..."
                      rows={5}
                      {...field}
                      className="bg-card"
                    />
                  </FormControl>
                   <FormDescription>
                    Please provide as much information as possible.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="contactEmail">Your Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      className="bg-card"
                    />
                  </FormControl>
                  <FormDescription>
                    We may contact you if we need more information (we won't share your email).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <PixelSendIcon />
              )}
              Submit Report
            </Button>
          </form>
        </Form>
         <p className="text-xs text-muted-foreground mt-6">
             Disclaimer: Reporting does not guarantee removal of content. This tool is for analysis and awareness. Platform-specific reporting tools should also be used where applicable.
          </p>
      </CardContent>
    </Card>
  );
}
