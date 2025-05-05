
"use client";

import type { ChangeEvent } from 'react';
import React, { useState, useCallback } from 'react';
import { analyzeDeepfake, type AnalyzeDeepfakeOutput } from '@/ai/flows/analyze-deepfake';
import { detectFaceSwap, type DetectFaceSwapOutput } from '@/ai/flows/detect-face-swap';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react'; // Keep Loader2 for animation
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Pixelated SVG Icons ---

// Pixelated ScanSearch Icon
const PixelScanSearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    {/* Magnifying glass part */}
    <path d="M10 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    <path d="M13 13l3 3" />
    {/* Box part */}
    <path d="M4 4h4v4H4z" />
    <path d="M4 16h4v4H4z" />
    <path d="M16 4h4v4h-4z" />
    <path d="M16 16h4v4h-4z" />
    <path d="M6 2v2 M18 2v2 M6 20v2 M18 20v2 M2 6h2 M2 18h2 M20 6h2 M20 18h2" />
  </svg>
);

// Pixelated Analyze Icon (Reuse from previous)
const PixelAnalyzeIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M10 18v-4h4v4h-4zM6 14v-4h4v4H6zM14 14v-4h4v4h-4zM10 10V6h4v4h-4zM6 6V2h4v4H6zM14 6V2h4v4h-4zM2 22h20M2 2h20" />
  </svg>
);

// Pixelated FaceSwap Icon (Reuse from previous)
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

// Pixelated AlertTriangle Icon (for error display)
const PixelAlertTriangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M2 20h20L12 4 2 20zm10-12v4m0 4v2" />
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
    setError(null); // Clear previous errors on new file selection
    setDeepfakeAnalysisResult(null); // Clear results
    setFaceSwapAnalysisResult(null); // Clear results
    setPreviewUrl(null); // Clear preview
    setFile(null); // Clear file

    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError("Invalid file type. Please upload an image (e.g., JPEG, PNG).");
        return;
      }
      const maxSizeMB = 10;
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
         setError(`File too large. Please upload an image under ${maxSizeMB}MB.`);
         return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyzeDeepfake = useCallback(async () => {
    if (!file || !previewUrl) {
      setError("No image selected. Please upload an image first.");
      return;
    }

    setIsDeepfakeLoading(true);
    setError(null);
    setDeepfakeAnalysisResult(null);
    setFaceSwapAnalysisResult(null);

    try {
      if (typeof previewUrl !== 'string' || !previewUrl.includes(';base64,')) {
        throw new Error("Internal error: Invalid image data format.");
      }

      const result = await analyzeDeepfake({ photoDataUri: previewUrl });
      setDeepfakeAnalysisResult(result);
      toast({
        title: "Deepfake Analysis Complete",
        description: "General deepfake analysis finished successfully.",
      });
    } catch (err) {
      console.error("Deepfake analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Analysis Failed: ${errorMessage}. Please try again or use a different image.`);
       toast({
        title: "Deepfake Analysis Error",
        description: `Could not analyze the image for general deepfakes. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsDeepfakeLoading(false);
    }
  }, [file, previewUrl, toast]);

  const handleDetectFaceSwap = useCallback(async () => {
      if (!file || !previewUrl) {
        setError("No image selected. Please upload an image first.");
        return;
      }

      setIsFaceSwapLoading(true);
      setError(null);
      setFaceSwapAnalysisResult(null);
      setDeepfakeAnalysisResult(null);

      try {
        if (typeof previewUrl !== 'string' || !previewUrl.includes(';base64,')) {
          throw new Error("Internal error: Invalid image data format.");
        }

        const result = await detectFaceSwap({ photoDataUri: previewUrl });
        setFaceSwapAnalysisResult(result);
        toast({
          title: "Face Swap Detection Complete",
          description: `Detection finished. ${result.isFaceSwapDetected ? 'Potential face swap detected.' : 'No clear face swap detected.'}`,
        });
      } catch (err) {
        console.error("Face swap detection failed:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Detection Failed: ${errorMessage}. Please try again or use a different image.`);
         toast({
          title: "Face Swap Detection Error",
          description: `Could not analyze the image for face swaps. ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setIsFaceSwapLoading(false);
      }
    }, [file, previewUrl, toast]);

  const getConfidenceStyling = (score: number): { borderClass: string; textClass: string; bgClass: string } => {
    if (score > 0.7) return { borderClass: 'border-destructive', textClass: 'text-destructive', bgClass: 'bg-destructive/10' }; // High confidence - Red
    if (score > 0.4) return { borderClass: 'border-accent', textClass: 'text-accent', bgClass: 'bg-accent/10' }; // Medium confidence - Pink/Magenta
    return { borderClass: 'border-primary', textClass: 'text-primary', bgClass: 'bg-primary/10' }; // Low confidence - Green
  };

  const getScoreLabel = (score: number, context: 'deepfake' | 'faceswap'): string => {
     const highLabel = context === 'faceswap' ? 'High Confidence (Likely Face Swap)' : 'High Confidence (Likely Deepfake)';
     const lowLabel = context === 'faceswap' ? 'Low Confidence (Likely No Face Swap)' : 'Low Confidence (Likely Real)';
    if (score > 0.7) return highLabel;
    if (score > 0.4) return 'Medium Confidence';
    return lowLabel;
  }

  const isLoading = isDeepfakeLoading || isFaceSwapLoading;

  return (
    <TooltipProvider>
      <Card className="w-full border-primary">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <PixelScanSearchIcon /> Image Analysis
          </CardTitle>
          <CardDescription>Upload an image to check if it might be a deepfake or contain a face swap.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-upload" className="text-lg font-medium">Upload Image</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-grow file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
                aria-describedby="file-error-message"
                aria-invalid={!!error}
              />
              {/* Action Buttons moved below preview */}
            </div>
             {error && (
               <Alert variant="destructive" id="file-error-message" className="mt-2">
                 <PixelAlertTriangleIcon />
                 <AlertTitle>Upload Error</AlertTitle>
                 <AlertDescription>
                   {error}
                 </AlertDescription>
               </Alert>
             )}
          </div>

           {previewUrl && (
              <div className="mt-4 border border-border p-4 flex flex-col items-center gap-4 bg-muted/50">
                  <Image
                  src={previewUrl}
                  alt="Image preview"
                  width={300}
                  height={300}
                  className="object-contain max-h-[300px] w-auto border border-border" // Added border to image itself
                  data-ai-hint="uploaded image preview"
                  />
                   {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button
                              onClick={handleAnalyzeDeepfake}
                              disabled={!file || isLoading}
                              className="w-full sm:w-auto"
                              variant="secondary"
                              aria-label="Analyze for general deepfake signs"
                          >
                              {isDeepfakeLoading ? (
                                  <Loader2 className="animate-spin mr-2" />
                              ) : (
                                  <PixelAnalyzeIcon />
                              )}
                              Analyze Deepfake (General)
                          </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>Check for common signs of deepfakes like artifacts and inconsistencies.</p>
                         </TooltipContent>
                       </Tooltip>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button
                              onClick={handleDetectFaceSwap}
                              disabled={!file || isLoading}
                              className="w-full sm:w-auto"
                              variant="secondary"
                              aria-label="Detect potential face swap"
                           >
                              {isFaceSwapLoading ? (
                                  <Loader2 className="animate-spin mr-2" />
                              ) : (
                                   <PixelFaceSwapIcon />
                              )}
                              Detect Face Swap
                           </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>Specifically look for evidence of face replacement.</p>
                         </TooltipContent>
                       </Tooltip>
                  </div>
              </div>
           )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-3 pt-4">
               <div className="flex items-center space-x-2 text-muted-foreground">
                 <Loader2 className="h-5 w-5 animate-spin text-primary" />
                 <p>Analyzing image, please wait...</p>
               </div>
               <Progress value={undefined} className="w-3/4 h-2 animate-pulse shadcn-progress-root" indicatorClassName="shadcn-progress-indicator" />
            </div>
          )}

          {/* --- Results Section --- */}
          {!isLoading && (deepfakeAnalysisResult || faceSwapAnalysisResult) && (
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-semibold text-center text-foreground border-b border-border pb-2">Analysis Results</h3>

              {/* Display General Deepfake Results */}
              {deepfakeAnalysisResult && (
                <Card className={`border-accent ${getConfidenceStyling(deepfakeAnalysisResult.confidenceScore).bgClass}`}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-accent">
                      <PixelAnalyzeIcon /> General Deepfake Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className={`border-l-4 p-3 rounded-none ${getConfidenceStyling(deepfakeAnalysisResult.confidenceScore).borderClass} bg-card`}>
                       <p className="text-xs font-medium text-muted-foreground mb-1">Confidence Score</p>
                       <div className="flex items-baseline gap-2">
                         <p className={`text-3xl font-bold ${getConfidenceStyling(deepfakeAnalysisResult.confidenceScore).textClass}`}>
                            {(deepfakeAnalysisResult.confidenceScore * 100).toFixed(1)}%
                         </p>
                         <p className={`text-xs font-semibold ${getConfidenceStyling(deepfakeAnalysisResult.confidenceScore).textClass}`}>
                           {getScoreLabel(deepfakeAnalysisResult.confidenceScore, 'deepfake')}
                         </p>
                       </div>
                       {/* Optional: Add a simple bar indicator */}
                       <Progress
                          value={deepfakeAnalysisResult.confidenceScore * 100}
                          className="h-1 mt-2 shadcn-progress-root"
                          indicatorClassName={`shadcn-progress-indicator ${getConfidenceStyling(deepfakeAnalysisResult.confidenceScore).borderClass.replace('border-', 'bg-')}`} // Use confidence color for bar
                        />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-foreground">Analysis Report:</h4>
                      <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-3 border border-border rounded-sm">
                        {deepfakeAnalysisResult.analysisReport}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Display Face Swap Results */}
              {faceSwapAnalysisResult && (
                <Card className={`border-secondary ${getConfidenceStyling(faceSwapAnalysisResult.confidenceScore).bgClass}`}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-secondary">
                       <PixelFaceSwapIcon /> Face Swap Detection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <Alert variant={faceSwapAnalysisResult.isFaceSwapDetected ? "destructive" : "default"} className="rounded-none">
                       <AlertTitle className="flex items-center gap-2">
                         {faceSwapAnalysisResult.isFaceSwapDetected ? <PixelAlertTriangleIcon /> : <PixelScanSearchIcon />} {/* Use pixel icons */}
                          Detection Status
                       </AlertTitle>
                       <AlertDescription>
                          {faceSwapAnalysisResult.isFaceSwapDetected
                              ? `A potential face swap was detected.`
                              : `No clear face swap detected.`
                          }
                       </AlertDescription>
                     </Alert>

                    <div className={`border-l-4 p-3 rounded-none ${getConfidenceStyling(faceSwapAnalysisResult.confidenceScore).borderClass} bg-card`}>
                       <p className="text-xs font-medium text-muted-foreground mb-1">Confidence Score</p>
                       <div className="flex items-baseline gap-2">
                           <p className={`text-3xl font-bold ${getConfidenceStyling(faceSwapAnalysisResult.confidenceScore).textClass}`}>
                              {(faceSwapAnalysisResult.confidenceScore * 100).toFixed(1)}%
                           </p>
                           <p className={`text-xs font-semibold ${getConfidenceStyling(faceSwapAnalysisResult.confidenceScore).textClass}`}>
                              {getScoreLabel(faceSwapAnalysisResult.confidenceScore, 'faceswap')}
                           </p>
                       </div>
                       <Progress
                          value={faceSwapAnalysisResult.confidenceScore * 100}
                          className="h-1 mt-2 shadcn-progress-root"
                          indicatorClassName={`shadcn-progress-indicator ${getConfidenceStyling(faceSwapAnalysisResult.confidenceScore).borderClass.replace('border-', 'bg-')}`}
                        />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1 text-foreground">Reasoning:</h4>
                      <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-3 border border-border rounded-sm">
                        {faceSwapAnalysisResult.reasoning}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

    