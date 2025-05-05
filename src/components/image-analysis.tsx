"use client";

import type { ChangeEvent } from 'react';
import React, { useState, useCallback } from 'react';
import { analyzeDeepfake, type AnalyzeDeepfakeOutput } from '@/ai/flows/analyze-deepfake';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Loader2, ScanSearch } from 'lucide-react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";

// Define the pixelated Upload icon using SVG
const PixelUploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M4 16v4h16v-4M12 4v12M8 8l4-4 4 4" />
  </svg>
);

// Define the pixelated Analyze icon using SVG
const PixelAnalyzeIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M10 18v-4h4v4h-4zM6 14v-4h4v4H6zM14 14v-4h4v4h-4zM10 10V6h4v4h-4zM6 6V2h4v4H6zM14 6V2h4v4h-4zM2 22h20M2 2h20" />
  </svg>
);

export default function ImageAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDeepfakeOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Basic image type validation
      if (!selectedFile.type.startsWith('image/')) {
        setError("Invalid file type. Please upload an image (JPEG, PNG, GIF, etc.).");
        setFile(null);
        setPreviewUrl(null);
        setAnalysisResult(null);
        return;
      }
      // Limit file size (e.g., 10MB)
      const maxSizeMB = 10;
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
         setError(`File size exceeds ${maxSizeMB}MB limit.`);
         setFile(null);
         setPreviewUrl(null);
         setAnalysisResult(null);
         return;
      }

      setFile(selectedFile);
      setError(null); // Clear previous errors
      setAnalysisResult(null); // Clear previous results
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!file || !previewUrl) {
      setError("Please select an image file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Ensure previewUrl is a string and contains the base64 header
      if (typeof previewUrl !== 'string' || !previewUrl.includes(';base64,')) {
        throw new Error("Invalid image data format.");
      }

      const result = await analyzeDeepfake({ photoDataUri: previewUrl });
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "Deepfake analysis finished successfully.",
      });
    } catch (err) {
      console.error("Analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
      setError(`Analysis failed: ${errorMessage}`);
       toast({
        title: "Analysis Error",
        description: `Failed to analyze the image. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [file, previewUrl, toast]);

  const getConfidenceColor = (score: number): string => {
    if (score > 0.7) return 'border-destructive text-destructive'; // High confidence (likely deepfake) - Red
    if (score > 0.4) return 'border-accent text-accent-foreground'; // Medium confidence - Yellow/Orange
    return 'border-primary text-primary'; // Low confidence (likely real) - Green
  };

  const getScoreLabel = (score: number): string => {
    if (score > 0.7) return 'High Confidence (Likely Deepfake)';
    if (score > 0.4) return 'Medium Confidence';
    return 'Low Confidence (Likely Real)';
  }

  return (
    <Card className="w-full border-primary shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <ScanSearch /> Image Deepfake Analysis
        </CardTitle>
        <CardDescription>Upload an image to check if it might be a deepfake.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image-upload" className="text-lg font-medium">Upload Image</Label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex-grow file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
              aria-describedby="file-error"
            />
             <Button
              onClick={handleAnalyze}
              disabled={!file || isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <PixelAnalyzeIcon />
              )}
              Analyze Image
            </Button>
          </div>
           {error && (
             <p id="file-error" className="text-sm text-destructive mt-2">{error}</p>
           )}
        </div>

        {previewUrl && (
          <div className="mt-4 border border-border p-4 flex justify-center items-center bg-muted/50">
            <Image
              src={previewUrl}
              alt="Image preview"
              width={300}
              height={300}
              className="object-contain max-h-[300px] w-auto"
              data-ai-hint="uploaded image preview"
            />
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-2 pt-4">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="text-muted-foreground">Analyzing image...</p>
             <Progress value={undefined} className="w-full h-2 animate-pulse" /> {/* Indeterminate progress */}
          </div>
        )}

        {analysisResult && !isLoading && (
          <Card className="mt-6 border-accent shadow-none">
            <CardHeader>
              <CardTitle className="text-xl">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`border-l-4 p-4 rounded-none ${getConfidenceColor(analysisResult.confidenceScore)} bg-card`}>
                 <p className="text-sm font-medium text-foreground mb-1">Confidence Score:</p>
                 <p className={`text-4xl font-bold ${getConfidenceColor(analysisResult.confidenceScore).split(' ')[1]}`}>
                    {(analysisResult.confidenceScore * 100).toFixed(1)}%
                 </p>
                 <p className="text-sm mt-1">{getScoreLabel(analysisResult.confidenceScore)}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Analysis Report:</h4>
                <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-3 border border-border">
                  {analysisResult.analysisReport}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
