
"use client";

import type { ChangeEvent } from 'react';
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { analyzeDeepfakeVideo, type AnalyzeDeepfakeVideoOutput } from '@/ai/flows/analyze-deepfake-video';
import { analyzeDeepfake, type AnalyzeDeepfakeOutput as AnalyzeDeepfakeImageOutput } from '@/ai/flows/analyze-deepfake';
import { detectFaceSwap, type DetectFaceSwapOutput } from '@/ai/flows/detect-face-swap';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react'; // Keep Loader2 for animation
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

// --- Pixelated SVG Icons ---

// Pixelated Video Icon
const PixelVideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M4 4h16v12H4z m0 12l4-4H4z m16 0l-4-4h4z M8 8h2v2H8z M14 8h2v2h-2z M8 14h8" />
  </svg>
);

// Pixelated Upload Icon
const PixelUploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M4 16v4h16v-4M12 4v12M8 8l4-4 4 4" />
  </svg>
);

// Pixelated Camera Icon
const PixelCameraIcon = () => (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M4 6h16v12H4z m4 -4h8v4h-8z m8 14h-8v-2h8z M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0" />
  </svg>
);

// Pixelated Analyze Icon (Reuse from previous)
const PixelAnalyzeIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M10 18v-4h4v4h-4zM6 14v-4h4v4H6zM14 14v-4h4v4h-4zM10 10V6h4v4h-4zM6 6V2h4v4H6zM14 6V2h4v4h-4zM2 22h20M2 2h20" />
  </svg>
);

// Pixelated StopCircle Icon
const PixelStopCircleIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
   <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M9 9h6v6H9z"/>
 </svg>
);

// Pixelated FaceSwap Icon (Reuse from previous)
const PixelFaceSwapIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M6 6h4v4H6z M7 10h2 M7 12h2"/>
    <path d="M14 6h4v4h-4z M15 10h2 M15 12h2"/>
    <path d="M4 14h6v6H4z M14 14h6v6h-6z" />
    <path d="M10 8h4 M12 10l2-2-2-2 M14 16h-4 M12 14l-2 2 2 2" />
 </svg>
);

// Pixelated ScanSearch Icon (Reuse from previous)
const PixelScanSearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M10 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /> <path d="M13 13l3 3" />
    <path d="M4 4h4v4H4z M4 16h4v4H4z M16 4h4v4h-4z M16 16h4v4h-4z" />
    <path d="M6 2v2 M18 2v2 M6 20v2 M18 20v2 M2 6h2 M2 18h2 M20 6h2 M20 18h2" />
  </svg>
);

// Pixelated AlertTriangle Icon (for error display)
const PixelAlertTriangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M2 20h20L12 4 2 20zm10-12v4m0 4v2" />
  </svg>
);

// Define type for general deepfake analysis results
type DisplayDeepfakeResult = {
    confidenceScore: number;
    explanation: string;
};

// Define type for frame analysis data points
type FrameAnalysisPoint = { time: number; score: number };

// Define types for chart time range options
type ChartTimeRangeOption = '10s' | '30s' | '1m' | 'all';
const timeRangeOptions: { value: ChartTimeRangeOption, label: string, durationMs?: number }[] = [
    { value: '10s', label: 'Last 10 Sec', durationMs: 10 * 1000 },
    { value: '30s', label: 'Last 30 Sec', durationMs: 30 * 1000 },
    { value: '1m', label: 'Last 1 Min', durationMs: 60 * 1000 },
    { value: 'all', label: 'All Time' },
];

export default function VideoAnalysis() {
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileAnalysisResult, setFileAnalysisResult] = useState<AnalyzeDeepfakeVideoOutput | null>(null);
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Live stream state
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [liveDeepfakeResult, setLiveDeepfakeResult] = useState<DisplayDeepfakeResult | null>(null);
  const [liveFaceSwapResult, setLiveFaceSwapResult] = useState<DetectFaceSwapOutput | null>(null);
  const [isLiveAnalysisLoading, setIsLiveAnalysisLoading] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [frameAnalysisData, setFrameAnalysisData] = useState<FrameAnalysisPoint[]>([]);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [chartTimeRange, setChartTimeRange] = useState<ChartTimeRangeOption>('all');

  const { toast } = useToast();

  // --- File Upload Logic ---
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFileError(null);
    setFileAnalysisResult(null);
    setVideoUrl(null);
    setFile(null);

    if (selectedFile) {
       if (!selectedFile.type.startsWith('video/')) {
        setFileError("Invalid file type. Please upload a video (e.g., MP4, WebM).");
        return;
      }
      const maxSizeMB = 100;
       if (selectedFile.size > maxSizeMB * 1024 * 1024) {
         setFileError(`File too large. Please upload a video under ${maxSizeMB}MB.`);
         return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyzeVideoFile = useCallback(async () => {
    if (!file || !videoUrl) {
      setFileError("No video file selected. Please upload a video first.");
      return;
    }

    setIsFileLoading(true);
    setFileError(null);
    setFileAnalysisResult(null);

    try {
      if (typeof videoUrl !== 'string' || !videoUrl.includes(';base64,')) {
        throw new Error("Internal error: Invalid video data format.");
      }

      const result = await analyzeDeepfakeVideo({ videoDataUri: videoUrl });
      setFileAnalysisResult(result);
      toast({
        title: "Video Analysis Complete",
        description: "Deepfake analysis for the video file finished.",
      });
    } catch (err) {
      console.error("Video analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setFileError(`Analysis Failed: ${errorMessage}. Please try again or use a different video.`);
       toast({
        title: "Video Analysis Error",
        description: `Could not analyze the video file. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsFileLoading(false);
    }
  }, [file, videoUrl, toast]);

  // --- Live Stream Logic ---
  const startStreaming = async () => {
    try {
      setLiveError(null);
      setLiveDeepfakeResult(null);
      setLiveFaceSwapResult(null);
      setFrameAnalysisData([]); // Reset chart data

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error); // Ensure playback starts
      }
      setIsStreaming(true);
      toast({ title: "Live Stream Started", description: "Camera feed active. Analyzing frames..."});

      // Initial analysis + interval
      analyzeLiveFrame(); // Analyze immediately
      analysisIntervalRef.current = setInterval(analyzeLiveFrame, 5000); // Analyze every 5 seconds

    } catch (err) {
       console.error("Error accessing camera:", err);
       const errorMsg = err instanceof Error && err.name === 'NotAllowedError'
          ? "Permission denied. Please allow camera access in browser settings."
          : err instanceof Error ? err.message : "Unknown camera error.";
       setLiveError(`Could not start camera: ${errorMsg}`);
       toast({ title: "Camera Error", description: `Failed to access camera. ${errorMsg}`, variant: "destructive" });
       setIsStreaming(false);
       if (analysisIntervalRef.current) {
         clearInterval(analysisIntervalRef.current);
         analysisIntervalRef.current = null;
       }
    }
  };

   const stopStreaming = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    streamRef.current = null;
    setIsStreaming(false);
    setIsLiveAnalysisLoading(false); // Ensure loading state is reset
    setLiveDeepfakeResult(null); // Optionally clear results on stop, or keep history
    setLiveFaceSwapResult(null);
    // setFrameAnalysisData([]); // Optionally clear chart data on stop
    toast({ title: "Live Stream Stopped", description: "Camera feed turned off." });
  };

  const analyzeLiveFrame = useCallback(async () => {
      if (!videoRef.current || videoRef.current.readyState < videoRef.current.HAVE_METADATA || !isStreaming || isLiveAnalysisLoading) return;

      setIsLiveAnalysisLoading(true);
      setLiveError(null); // Clear previous frame error

      try {
          const canvas = document.createElement('canvas');
          // Lower resolution for faster analysis
          const scale = 0.4;
          canvas.width = videoRef.current.videoWidth * scale;
          canvas.height = videoRef.current.videoHeight * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Failed to get canvas context");

          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const frameDataUri = canvas.toDataURL('image/jpeg', 0.7); // Adjust quality if needed

          const [deepfakeResult, faceSwapResult] = await Promise.all([
              analyzeDeepfake({ photoDataUri: frameDataUri }).catch(err => ({ error: err, type: 'deepfake' })),
              detectFaceSwap({ photoDataUri: frameDataUri }).catch(err => ({ error: err, type: 'faceswap' }))
          ]);

          let currentFrameError = null;

          // Process deepfake result
          if ('error' in deepfakeResult) {
              console.error("Live Deepfake analysis error:", deepfakeResult.error);
              currentFrameError = `Deepfake analysis failed: ${deepfakeResult.error instanceof Error ? deepfakeResult.error.message : "Unknown"}`;
              setLiveDeepfakeResult(null);
          } else {
              const displayResult: DisplayDeepfakeResult = {
                  confidenceScore: deepfakeResult.confidenceScore,
                  explanation: deepfakeResult.analysisReport
              };
              setLiveDeepfakeResult(displayResult);
              setFrameAnalysisData((prevData) => [
                ...prevData,
                { time: Date.now(), score: deepfakeResult.confidenceScore },
              ]);
          }

          // Process face swap result
          if ('error' in faceSwapResult) {
               console.error("Live FaceSwap analysis error:", faceSwapResult.error);
              const faceSwapErrorMsg = `FaceSwap analysis failed: ${faceSwapResult.error instanceof Error ? faceSwapResult.error.message : "Unknown"}`;
              currentFrameError = currentFrameError ? `${currentFrameError}; ${faceSwapErrorMsg}` : faceSwapErrorMsg;
              setLiveFaceSwapResult(null);
          } else {
              setLiveFaceSwapResult(faceSwapResult);
          }

          if(currentFrameError) {
            setLiveError(currentFrameError); // Show error for this frame
          }

      } catch (err) {
          console.error("Live frame capture/analysis error:", err);
          const errorMessage = err instanceof Error ? err.message : "Unknown error during frame processing.";
          setLiveError(`Frame Analysis Error: ${errorMessage}`);
          // Stop continuous analysis on critical errors? Or just log and continue?
          // stopStreaming(); // Example: Stop if canvas fails
      } finally {
          setIsLiveAnalysisLoading(false);
      }
  }, [isStreaming, isLiveAnalysisLoading]); // Removed toast dependency

   // Effect to stop stream and clear interval on component unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, []);

  // --- Common Result Display Logic ---
  const getConfidenceStyling = (score: number): { borderClass: string; textClass: string; bgClass: string } => {
    if (score > 0.7) return { borderClass: 'border-destructive', textClass: 'text-destructive', bgClass: 'bg-destructive/10' };
    if (score > 0.4) return { borderClass: 'border-accent', textClass: 'text-accent', bgClass: 'bg-accent/10' };
    return { borderClass: 'border-primary', textClass: 'text-primary', bgClass: 'bg-primary/10' };
  };

  const getScoreLabel = (score: number, context: 'deepfake' | 'faceswap'): string => {
    const highLabel = context === 'faceswap' ? 'High Confidence (Likely Swap)' : 'High Confidence (Likely Deepfake)';
    const lowLabel = context === 'faceswap' ? 'Low Confidence (Likely No Swap)' : 'Low Confidence (Likely Real)';
    if (score > 0.7) return highLabel;
    if (score > 0.4) return 'Medium Confidence';
    return lowLabel;
  }

  const renderAnalysisResultCard = (
    title: string,
    TitleIcon: React.ElementType,
    titleColor: string,
    borderColor: string,
    confidenceScore: number,
    scoreLabelContext: 'deepfake' | 'faceswap',
    explanation: string | React.ReactNode, // Allow ReactNode for custom content like Alerts
    isLoadingState: boolean // Pass loading state specific to this result
    ) => {
        const styling = getConfidenceStyling(confidenceScore);
        return (
            <Card className={`${borderColor} ${styling.bgClass}`}>
                 <CardHeader>
                    <CardTitle className={`text-lg flex items-center gap-2 ${titleColor}`}>
                        <TitleIcon /> {title}
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     <div className={`border-l-4 p-3 rounded-none ${styling.borderClass} bg-card`}>
                         <p className="text-xs font-medium text-muted-foreground mb-1">Confidence Score</p>
                         <div className="flex items-baseline gap-2">
                             <p className={`text-3xl font-bold ${styling.textClass}`}>
                                 {(confidenceScore * 100).toFixed(1)}%
                             </p>
                             <p className={`text-xs font-semibold ${styling.textClass}`}>
                                 {getScoreLabel(confidenceScore, scoreLabelContext)}
                             </p>
                         </div>
                         <Progress
                            value={confidenceScore * 100}
                            className="h-1 mt-2 shadcn-progress-root"
                            indicatorClassName={`shadcn-progress-indicator ${styling.borderClass.replace('border-', 'bg-')}`}
                          />
                     </div>
                     <div>
                         <h4 className="font-semibold mb-1 text-foreground">Details / Reasoning:</h4>
                         {typeof explanation === 'string' ? (
                             <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-3 border border-border rounded-sm">
                                 {explanation}
                             </p>
                         ) : (
                            <div className="bg-muted/30 p-3 border border-border rounded-sm">{explanation}</div>
                         )}
                     </div>
                 </CardContent>
                 {isLoadingState && ( // Show mini-loader within card if specific result is loading
                     <div className="absolute inset-0 bg-card/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                     </div>
                 )}
            </Card>
        );
   };


  // Chart configuration
  const chartConfig = {
    score: {
      label: "Confidence",
      color: "hsl(var(--chart-1))", // Green
    },
  } satisfies ChartConfig;

  // Filter chart data
  const filteredChartData = useMemo(() => {
    const selectedOption = timeRangeOptions.find(opt => opt.value === chartTimeRange);
    if (!selectedOption || !selectedOption.durationMs) {
      return frameAnalysisData; // 'all'
    }
    const now = Date.now();
    const cutoffTime = now - selectedOption.durationMs;
    return frameAnalysisData.filter(point => point.time >= cutoffTime);
  }, [frameAnalysisData, chartTimeRange]);


  return (
    <TooltipProvider>
      <Card className="w-full border-primary">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <PixelVideoIcon /> Video Analysis
          </CardTitle>
          <CardDescription>Upload a video file or use your camera for live frame-by-frame analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 shadcn-tabs-list">
              <TabsTrigger value="file" className="flex items-center gap-2 shadcn-tabs-trigger">
                <PixelUploadIcon /> Upload File
              </TabsTrigger>
              <TabsTrigger value="live" className="flex items-center gap-2 shadcn-tabs-trigger">
                <PixelCameraIcon /> Live Stream
              </TabsTrigger>
            </TabsList>

            {/* --- File Upload Tab --- */}
            <TabsContent value="file" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="video-upload" className="text-lg font-medium">Upload Video File</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="flex-grow file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
                    aria-describedby="file-error-message"
                    aria-invalid={!!fileError}
                  />
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Button
                          onClick={handleAnalyzeVideoFile}
                          disabled={!file || isFileLoading}
                          className="w-full sm:w-auto"
                          variant="secondary"
                          aria-label="Analyze uploaded video file"
                       >
                          {isFileLoading ? <Loader2 className="animate-spin mr-2" /> : <PixelAnalyzeIcon />}
                          Analyze Video (File)
                       </Button>
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Analyze the entire uploaded video for deepfake signs.</p>
                     </TooltipContent>
                   </Tooltip>
                </div>
                 {fileError && (
                    <Alert variant="destructive" id="file-error-message" className="mt-2">
                        <PixelAlertTriangleIcon />
                        <AlertTitle>Upload Error</AlertTitle>
                        <AlertDescription>{fileError}</AlertDescription>
                    </Alert>
                 )}
              </div>

              {/* File Video Preview */}
              {videoUrl && (
                <div className="mt-4 border border-border p-2 flex justify-center items-center bg-muted/50">
                  <video
                    src={videoUrl}
                    controls
                    className="max-w-full max-h-[400px] border border-border"
                    data-ai-hint="uploaded video preview"
                  />
                </div>
              )}

              {/* File Loading Indicator */}
              {isFileLoading && (
                <div className="flex flex-col items-center justify-center space-y-3 pt-4">
                   <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p>Analyzing video file, this may take a moment...</p>
                   </div>
                   <Progress value={undefined} className="w-3/4 h-2 animate-pulse shadcn-progress-root" indicatorClassName="shadcn-progress-indicator"/>
                </div>
              )}

              {/* File Analysis Result */}
              {!isFileLoading && fileAnalysisResult && renderAnalysisResultCard(
                    "Video File Deepfake Analysis",
                    PixelAnalyzeIcon,
                    "text-primary", // Use primary color for file result title
                    "border-primary", // Use primary border for file result card
                    fileAnalysisResult.confidenceScore,
                    'deepfake',
                    fileAnalysisResult.explanation,
                    false // Not loading once result is shown
              )}
            </TabsContent>

            {/* --- Live Stream Tab --- */}
            <TabsContent value="live" className="space-y-6">
              {/* Start/Stop Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 {!isStreaming ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={startStreaming} className="w-full sm:w-auto" variant="secondary" aria-label="Start camera and live analysis">
                                <PixelCameraIcon /> Start Camera & Live Analysis
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Uses your webcam to analyze frames in real-time.</p>
                        </TooltipContent>
                    </Tooltip>

                 ) : (
                   <Tooltip>
                       <TooltipTrigger asChild>
                           <Button onClick={stopStreaming} variant="destructive" className="w-full sm:w-auto" aria-label="Stop camera and analysis">
                               <PixelStopCircleIcon /> Stop Camera & Analysis
                           </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                           <p>Turns off the webcam and stops analysis.</p>
                       </TooltipContent>
                   </Tooltip>
                 )}
              </div>

               {/* Live Video Feed */}
               <div className="relative mt-4 border border-border p-1 flex justify-center items-center bg-black aspect-video">
                   <video
                       ref={videoRef}
                       muted
                       autoPlay
                       playsInline // Important for mobile
                       className="max-w-full max-h-[400px] w-auto transform scale-x-[-1]" // Mirror view
                       data-ai-hint="live camera feed"
                   />
                   {/* Live Loading Indicator (Overlay) */}
                   {isStreaming && isLiveAnalysisLoading && (
                       <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-foreground z-10">
                           <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                           <p className="text-sm">Analyzing frame...</p>
                       </div>
                   )}
               </div>

                {/* Initial Instructions / Error Display */}
               {!isStreaming && !liveError && frameAnalysisData.length === 0 && (
                   <div className="text-center text-muted-foreground py-4">
                      Click "Start Camera" to begin live analysis. Ensure camera permissions are allowed.
                   </div>
               )}
               {liveError && ( // Display persistent live errors here
                    <Alert variant="destructive" className="mt-4">
                        <PixelAlertTriangleIcon />
                        <AlertTitle>Live Analysis Error</AlertTitle>
                        <AlertDescription>{liveError}</AlertDescription>
                    </Alert>
               )}

               {/* --- Live Results Section --- */}
               {(liveDeepfakeResult || liveFaceSwapResult) && (
                   <div className="space-y-6 pt-4">
                        <h3 className="text-xl font-semibold text-center text-foreground border-b border-border pb-2">Live Analysis Results</h3>

                        {/* Live Deepfake Result */}
                        {liveDeepfakeResult && renderAnalysisResultCard(
                            "Live Frame Deepfake Analysis",
                            PixelAnalyzeIcon,
                            "text-accent", // Accent color for live deepfake
                            "border-accent",
                            liveDeepfakeResult.confidenceScore,
                            'deepfake',
                            liveDeepfakeResult.explanation,
                            isLiveAnalysisLoading // Pass specific loading state
                        )}

                        {/* Live Face Swap Result */}
                        {liveFaceSwapResult && renderAnalysisResultCard(
                             "Live Frame Face Swap Detection",
                             PixelFaceSwapIcon,
                             "text-secondary", // Secondary color for face swap
                             "border-secondary",
                             liveFaceSwapResult.confidenceScore,
                             'faceswap',
                             // Provide Alert as explanation for richer display
                             <Alert variant={liveFaceSwapResult.isFaceSwapDetected ? "destructive" : "default"} className="rounded-none border-none bg-transparent p-0">
                                <AlertTitle className="flex items-center gap-2 mb-2">
                                    {liveFaceSwapResult.isFaceSwapDetected ? <PixelAlertTriangleIcon /> : <PixelScanSearchIcon />}
                                    Detection Status: {liveFaceSwapResult.isFaceSwapDetected ? 'Potential Swap Detected' : 'No Clear Swap Detected'}
                                </AlertTitle>
                                <AlertDescription className="text-sm text-foreground whitespace-pre-wrap">
                                    {liveFaceSwapResult.reasoning}
                                </AlertDescription>
                             </Alert>,
                             isLiveAnalysisLoading // Pass specific loading state
                        )}
                   </div>
               )}


              {/* --- Live Analysis Chart --- */}
              {(isStreaming || frameAnalysisData.length > 0) && (
                   <Card className="mt-6 border-primary">
                      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
                         <div className="space-y-1.5">
                              <CardTitle className="text-lg text-primary">Live Confidence Score Trend</CardTitle>
                              <CardDescription>General deepfake confidence score over time.</CardDescription>
                          </div>
                          <div className="w-full sm:w-[160px]">
                              <Label htmlFor="chart-time-range" className="sr-only">Chart Time Range</Label>
                              <Select value={chartTimeRange} onValueChange={(value) => setChartTimeRange(value as ChartTimeRangeOption)}>
                                  <SelectTrigger id="chart-time-range" aria-label="Select chart time range">
                                      <SelectValue placeholder="Time Range" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {timeRangeOptions.map(option => (
                                          <SelectItem key={option.value} value={option.value}>
                                              {option.label}
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                      </CardHeader>
                      <CardContent className="pr-0"> {/* Adjust padding for axis labels */}
                         {filteredChartData.length > 1 ? (
                             <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                   <LineChart
                                      data={filteredChartData}
                                      margin={{ top: 5, right: 15, left: -10, bottom: 5 }} // Adjusted margins
                                   >
                                      <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border) / 0.3)" />
                                      <XAxis
                                        dataKey="time"
                                        type="number"
                                        domain={['dataMin', 'dataMax']}
                                        tickFormatter={(unixTime) => format(new Date(unixTime), 'HH:mm:ss')}
                                        stroke="hsl(var(--muted-foreground))"
                                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                        axisLine={{ stroke: 'hsl(var(--border))' }}
                                        tickLine={{ stroke: 'hsl(var(--border))' }}
                                      />
                                      <YAxis
                                         domain={[0, 1]}
                                         stroke="hsl(var(--muted-foreground))"
                                         tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                         axisLine={{ stroke: 'hsl(var(--border))' }}
                                         tickLine={{ stroke: 'hsl(var(--border))' }}
                                         label={{ value: 'Confidence', angle: -90, position: 'insideLeft', offset: 0, style: { textAnchor: 'middle', fontSize: '10px', fill: 'hsl(var(--muted-foreground))' } }}
                                      />
                                      <RechartsTooltip
                                        content={<ChartTooltipContent indicator="line" labelFormatter={(value, payload) => payload && payload[0] ? format(new Date(payload[0].payload.time), 'PPpp') : ''} />} // More detailed time
                                        cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                                        wrapperStyle={{ outline: 'none' }}
                                        itemStyle={{ color: 'hsl(var(--popover-foreground))'}}
                                        labelStyle={{ color: 'hsl(var(--popover-foreground))'}}
                                      />
                                      <Line
                                        dataKey="score"
                                        type="monotone"
                                        stroke="var(--color-score)" // Green
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={false} // Disable animation for real-time feel
                                      />
                                   </LineChart>
                                </ResponsiveContainer>
                             </ChartContainer>
                         ) : (
                             <div className="flex items-center justify-center h-[200px] text-center text-muted-foreground">
                                 {isStreaming ? "Collecting data for trend chart..." : "Not enough data to display trend."}
                             </div>
                         )}
                      </CardContent>
                   </Card>
              )}

               {/* Help text */}
               {isStreaming && (
                   <Alert variant="default" className="mt-4">
                        <AlertDescription>
                           Live analysis processes frames approx. every 5 seconds. Results and chart update automatically. Use the dropdown to change the chart's time view.
                        </AlertDescription>
                   </Alert>
               )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

    