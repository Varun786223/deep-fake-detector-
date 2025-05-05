
"use client";

import type { ChangeEvent } from 'react';
import React, { useState, useCallback } from 'react';
import { analyzeDeepfake, type AnalyzeDeepfakeOutput } from '@/ai/flows/analyze-deepfake';
import { detectFaceSwap, type DetectFaceSwapOutput } from '@/ai/flows/detect-face-swap'; // Import face swap flow
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Added CardFooter
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Loader2, ScanSearch, Replace } from 'lucide-react'; // Added Replace icon
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator'; // Added Separator

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

// Define the pixelated FaceSwap icon using SVG (Improved)
const PixelFaceSwapIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    {/* Face 1 */}
    <path d="M6 6h4v4H6z M7 10h2 M7 12h2"/>
    {/* Face 2 */}
    <path d="M14 6h4v4h-4z M15 10h2 M15 12h2"/>
    {/* Body/Placeholder */}
    <path d="M4 14h6v6H4z M14 14h6v6h-6z" />
    {/* Swap Arrows (Simplified) */}
    <path d="M10 8h4 M12 10l2-2-2-2 M14 16h-4 M12 14l-2 2 2 2" />
 </svg>
);


export default function ImageAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deepfakeAnalysisResult, setDeepfakeAnalysisResult] = useState<AnalyzeDeepfakeOutput | null>(null);
  const [faceSwapAnalysisResult, setFaceSwapAnalysisResult] = useState<DetectFaceSwapOutput | null>(null);
  const [isDeepfakeLoading, setIsDeepfakeLoading] = useState<boolean>(false);
  const [isFaceSwapLoading, setIsFaceSwapLoading] = useState<boolean>(false);
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
        setDeepfakeAnalysisResult(null);
        setFaceSwapAnalysisResult(null);
        return;
      }
      // Limit file size (e.g., 10MB)
      const maxSizeMB = 10;
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
         setError(`File size exceeds ${maxSizeMB}MB limit.`);
         setFile(null);
         setPreviewUrl(null);
         setDeepfakeAnalysisResult(null);
         setFaceSwapAnalysisResult(null);
         return;
      }

      setFile(selectedFile);
      setError(null); // Clear previous errors
      setDeepfakeAnalysisResult(null); // Clear previous results
      setFaceSwapAnalysisResult(null); // Clear previous results
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

  const handleAnalyzeDeepfake = useCallback(async () => {
    if (!file || !previewUrl) {
      setError("Please select an image file first.");
      return;
    }

    setIsDeepfakeLoading(true);
    setError(null);
    setDeepfakeAnalysisResult(null); // Clear previous deepfake result only
    setFaceSwapAnalysisResult(null); // Also clear face swap result

    try {
      if (typeof previewUrl !== 'string' || !previewUrl.includes(';base64,')) {
        throw new Error("Invalid image data format.");
      }

      const result = await analyzeDeepfake({ photoDataUri: previewUrl });
      setDeepfakeAnalysisResult(result);
      toast({
        title: "Deepfake Analysis Complete",
        description: "General deepfake analysis finished successfully.",
      });
    } catch (err) {
      console.error("Deepfake analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
      setError(`Deepfake analysis failed: ${errorMessage}`);
       toast({
        title: "Deepfake Analysis Error",
        description: `Failed to analyze the image for deepfakes. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsDeepfakeLoading(false);
    }
  }, [file, previewUrl, toast]);

  const handleDetectFaceSwap = useCallback(async () => {
      if (!file || !previewUrl) {
        setError("Please select an image file first.");
        return;
      }

      setIsFaceSwapLoading(true);
      setError(null);
      setFaceSwapAnalysisResult(null); // Clear previous face swap result only
      setDeepfakeAnalysisResult(null); // Also clear general deepfake result

      try {
        if (typeof previewUrl !== 'string' || !previewUrl.includes(';base64,')) {
          throw new Error("Invalid image data format.");
        }

        const result = await detectFaceSwap({ photoDataUri: previewUrl });
        setFaceSwapAnalysisResult(result);
        toast({
          title: "Face Swap Detection Complete",
          description: `Detection finished. ${result.isFaceSwapDetected ? 'Potential face swap detected.' : 'No clear face swap detected.'}`,
        });
      } catch (err) {
        console.error("Face swap detection failed:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during detection.";
        setError(`Face swap detection failed: ${errorMessage}`);
         toast({
          title: "Face Swap Detection Error",
          description: `Failed to analyze the image for face swaps. ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setIsFaceSwapLoading(false);
      }
    }, [file, previewUrl, toast]);

  const getConfidenceColor = (score: number): string => {
    if (score > 0.7) return 'border-destructive text-destructive'; // High confidence - Red
    if (score > 0.4) return 'border-accent text-accent-foreground'; // Medium confidence - Yellow/Orange
    return 'border-primary text-primary'; // Low confidence - Green
  };

  const getScoreLabel = (score: number, context: 'deepfake' | 'faceswap'): string => {
     const highLabel = context === 'faceswap' ? 'High Confidence (Likely Face Swap)' : 'High Confidence (Likely Deepfake)';
     const lowLabel = context === 'faceswap' ? 'Low Confidence (Likely No Face Swap)' : 'Low Confidence (Likely Real)';
    if (score > 0.7) return highLabel;
    if (score > 0.4) return 'Medium Confidence';
    return lowLabel;
  }

  // Combined loading state
  const isLoading = isDeepfakeLoading || isFaceSwapLoading;

  return (
    <Card className="w-full border-primary shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <ScanSearch /> Image Analysis
        </CardTitle>
        <CardDescription>Upload an image to check if it might be a deepfake or contain a face swap.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image-upload" className="text-lg font-medium">Upload Image</Label>
          <div className="flex items-center gap-4">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex-grow file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
              aria-describedby="file-error"
            />
             {/* Removed Upload button, actions below */}
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

         {/* Action Buttons */}
         <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
             <Button
                onClick={handleAnalyzeDeepfake}
                disabled={!file || isLoading}
                className="w-full sm:w-auto"
                variant="secondary"
            >
                {isDeepfakeLoading ? (
                    <Loader2 className="animate-spin mr-2" />
                ) : (
                    <PixelAnalyzeIcon />
                )}
                Analyze Deepfake (General)
            </Button>
             <Button
                onClick={handleDetectFaceSwap}
                disabled={!file || isLoading}
                className="w-full sm:w-auto"
                variant="secondary"
             >
                {isFaceSwapLoading ? (
                    <Loader2 className="animate-spin mr-2" />
                ) : (
                     <PixelFaceSwapIcon />
                )}
                Detect Face Swap
             </Button>
         </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-2 pt-4">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="text-muted-foreground">Analyzing image...</p>
             <Progress value={undefined} className="w-full h-2 animate-pulse" /> {/* Indeterminate progress */}
          </div>
        )}

        {/* Display Results Separately */}
        {deepfakeAnalysisResult && !isDeepfakeLoading && (
          <Card className="mt-6 border-accent shadow-none">
            <CardHeader>
              <CardTitle className="text-xl">General Deepfake Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`border-l-4 p-4 rounded-none ${getConfidenceColor(deepfakeAnalysisResult.confidenceScore)} bg-card`}>
                 <p className="text-sm font-medium text-foreground mb-1">Confidence Score:</p>
                 <p className={`text-4xl font-bold ${getConfidenceColor(deepfakeAnalysisResult.confidenceScore).split(' ')[1]}`}>
                    {(deepfakeAnalysisResult.confidenceScore * 100).toFixed(1)}%
                 </p>
                 <p className="text-sm mt-1">{getScoreLabel(deepfakeAnalysisResult.confidenceScore, 'deepfake')}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Analysis Report:</h4>
                <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-3 border border-border">
                  {deepfakeAnalysisResult.analysisReport}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {faceSwapAnalysisResult && !isFaceSwapLoading && (
          <Card className="mt-6 border-blue-500 shadow-none"> {/* Use a different border color for distinction */}
            <CardHeader>
              <CardTitle className="text-xl">Face Swap Detection Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <Alert variant={faceSwapAnalysisResult.isFaceSwapDetected ? "destructive" : "default"} className="rounded-none">
                 <AlertTitle className="flex items-center gap-2">
                   {faceSwapAnalysisResult.isFaceSwapDetected ? <Replace className="text-destructive" /> : <ScanSearch />} {/* Icon changes based on detection */}
                    Detection Status
                 </AlertTitle>
                 <AlertDescription>
                    {faceSwapAnalysisResult.isFaceSwapDetected
                        ? `A potential face swap was detected with ${ (faceSwapAnalysisResult.confidenceScore * 100).toFixed(1)}% confidence.`
                        : `No clear face swap detected (Confidence: ${(faceSwapAnalysisResult.confidenceScore * 100).toFixed(1)}%).`
                    }
                 </AlertDescription>
               </Alert>

              <div className={`border-l-4 p-4 rounded-none ${getConfidenceColor(faceSwapAnalysisResult.confidenceScore)} bg-card`}>
                 <p className="text-sm font-medium text-foreground mb-1">Confidence Score:</p>
                 <p className={`text-4xl font-bold ${getConfidenceColor(faceSwapAnalysisResult.confidenceScore).split(' ')[1]}`}>
                    {(faceSwapAnalysisResult.confidenceScore * 100).toFixed(1)}%
                 </p>
                 <p className="text-sm mt-1">{getScoreLabel(faceSwapAnalysisResult.confidenceScore, 'faceswap')}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Reasoning:</h4>
                <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-3 border border-border">
                  {faceSwapAnalysisResult.reasoning}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
