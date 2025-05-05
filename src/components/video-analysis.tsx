
"use client";

import type { ChangeEvent } from 'react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeDeepfakeVideo, type AnalyzeDeepfakeVideoOutput } from '@/ai/flows/analyze-deepfake-video';
import { analyzeDeepfake, type AnalyzeDeepfakeOutput as AnalyzeDeepfakeImageOutput } from '@/ai/flows/analyze-deepfake'; // Import analyzeDeepfake for frame analysis
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Loader2, Video, Camera, StopCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Import chart components
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig // Import ChartConfig type
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip, // Alias Recharts Tooltip to avoid conflict with ShadCN Tooltip
  Legend as RechartsLegend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns'; // For formatting chart time axis

// Define the pixelated Analyze icon using SVG
const PixelAnalyzeIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M10 18v-4h4v4h-4zM6 14v-4h4v4H6zM14 14v-4h4v4h-4zM10 10V6h4v4h-4zM6 6V2h4v4H6zM14 6V2h4v4h-4zM2 22h20M2 2h20" />
  </svg>
);

// Define a type that can hold results from either video or image analysis for display
type DisplayAnalysisResult = {
    confidenceScore: number;
    explanation: string;
};

// Define type for frame analysis data points
type FrameAnalysisPoint = { time: number; score: number };


export default function VideoAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDeepfakeVideoOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [liveAnalysisResult, setLiveAnalysisResult] = useState<DisplayAnalysisResult | null>(null); // Use combined type
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [frameAnalysisData, setFrameAnalysisData] = useState<FrameAnalysisPoint[]>([]); // State for chart data
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for interval ID

  // --- File Upload Logic ---
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
       if (!selectedFile.type.startsWith('video/')) {
        setError("Invalid file type. Please upload a video file.");
        setFile(null);
        setVideoUrl(null);
        setAnalysisResult(null);
        return;
      }
      // Limit file size (e.g., 100MB)
      const maxSizeMB = 100;
       if (selectedFile.size > maxSizeMB * 1024 * 1024) {
         setError(`File size exceeds ${maxSizeMB}MB limit.`);
         setFile(null);
         setVideoUrl(null);
         setAnalysisResult(null);
         return;
      }

      setFile(selectedFile);
      setError(null);
      setAnalysisResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setVideoUrl(null);
    }
  };

  const handleAnalyzeVideoFile = useCallback(async () => {
    if (!file || !videoUrl) {
      setError("Please select a video file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      if (typeof videoUrl !== 'string' || !videoUrl.includes(';base64,')) {
        throw new Error("Invalid video data format.");
      }

      const result = await analyzeDeepfakeVideo({ videoDataUri: videoUrl });
      setAnalysisResult(result);
      toast({
        title: "Video Analysis Complete",
        description: "Deepfake analysis for the video file finished successfully.",
      });
    } catch (err) {
      console.error("Video analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
      setError(`Video analysis failed: ${errorMessage}`);
       toast({
        title: "Video Analysis Error",
        description: `Failed to analyze the video file. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [file, videoUrl, toast]);


  // --- Live Stream Logic ---

  const startStreaming = async () => {
    try {
      setLiveError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error); // Start playing the stream
      }
      setIsStreaming(true);
      toast({ title: "Live Stream Started", description: "Camera feed is active."});
      // Start automatic frame analysis loop
      analysisIntervalRef.current = setInterval(() => {
        analyzeLiveFrame();
      }, 2000); // Analyze every 2 seconds, adjust interval as needed

      // Reset chart data when starting stream
      setFrameAnalysisData([]);

    } catch (err) {
       console.error("Error accessing camera:", err);
       const errorMsg = err instanceof Error ? err.message : "Unknown error";
       setLiveError(`Could not access camera: ${errorMsg}. Please ensure permissions are granted.`);
       toast({ title: "Camera Error", description: `Could not access camera: ${errorMsg}`, variant: "destructive" });
       setIsStreaming(false);
       // Ensure interval is cleared if starting failed
       if (analysisIntervalRef.current) {
         clearInterval(analysisIntervalRef.current);
         analysisIntervalRef.current = null;
       }
    }
  };

   const stopStreaming = () => {
    // Clear the analysis interval
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
    setIsLiveLoading(false); // Stop loading indicator if analysis was running
    setLiveAnalysisResult(null); // Clear live results
    setLiveError(null); // Clear errors
    // Don't clear frameAnalysisData here, keep the history
    toast({ title: "Live Stream Stopped", description: "Camera feed turned off." });
  };

  // Function for analyzing a single frame from the live stream
  const analyzeLiveFrame = useCallback(async () => {
      if (!videoRef.current || !isStreaming || isLiveLoading) return; // Prevent overlapping analyses

      setIsLiveLoading(true); // Indicate processing started
      setLiveError(null); // Clear previous errors
      // Keep previous liveAnalysisResult visible until new one arrives
      // setLiveAnalysisResult(null);

      try {
          const canvas = document.createElement('canvas');
          // Reduce canvas size for faster processing/smaller data URI, adjust as needed
          const scale = 0.5;
          canvas.width = videoRef.current.videoWidth * scale;
          canvas.height = videoRef.current.videoHeight * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not get canvas context");

          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const frameDataUri = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG with compression

          // Use the image analysis flow for individual frames
          const result: AnalyzeDeepfakeImageOutput = await analyzeDeepfake({ photoDataUri: frameDataUri });

          const displayResult: DisplayAnalysisResult = {
              confidenceScore: result.confidenceScore,
              explanation: result.analysisReport // Map analysisReport to explanation
          };
          setLiveAnalysisResult(displayResult);

          // Add data point to chart
          setFrameAnalysisData((prevData) => [
            ...prevData,
            { time: Date.now(), score: result.confidenceScore },
          ]);

           // Only show toast if manually triggered? Or maybe reduce frequency.
           // For now, commenting out the automatic toast per frame.
           /*
           toast({
             title: "Live Frame Analyzed",
             description: `Confidence: ${(result.confidenceScore * 100).toFixed(1)}%`,
           });
           */
      } catch (err) {
          console.error("Live frame analysis failed:", err);
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          setLiveError(`Live analysis failed: ${errorMessage}`);
          // Optionally show a toast for live analysis errors
          // toast({ title: "Live Analysis Error", description: errorMessage, variant: "destructive" });
      } finally {
          setIsLiveLoading(false); // Indicate processing finished
      }
  }, [isStreaming, isLiveLoading, toast]); // Dependencies added isLiveLoading

   // Effect to stop stream and clear interval on component unmount
  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      stopStreaming(); // Ensure stream is stopped properly
    };
  }, []);


  // --- Common Result Display Logic ---
  const getConfidenceColor = (score: number): string => {
    if (score > 0.7) return 'border-destructive text-destructive';
    if (score > 0.4) return 'border-accent text-accent-foreground';
    return 'border-primary text-primary';
  };

  const getScoreLabel = (score: number): string => {
    if (score > 0.7) return 'High Confidence (Likely Deepfake)';
    if (score > 0.4) return 'Medium Confidence';
    return 'Low Confidence (Likely Real)';
  }

  // Unified result rendering function
  const renderAnalysisResult = (
    result: DisplayAnalysisResult | null,
    currentError: string | null,
    currentLoading: boolean,
    titlePrefix: string
  ) => {
      // Don't show loading indicator for live stream automatic updates
      // Only show loading for the initial file upload or manual frame analysis
      const showLoading = currentLoading && (titlePrefix === "Video File" || !analysisIntervalRef.current);

      if (showLoading) {
          return (
              <div className="flex flex-col items-center justify-center space-y-2 pt-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analyzing {titlePrefix.toLowerCase()}...</p>
                  <Progress value={undefined} className="w-full h-2 animate-pulse" />
              </div>
          );
      }
      // Only show error if not loading and error exists
      if (!showLoading && currentError) {
          return (
               <Alert variant="destructive" className="mt-4">
                 <AlertTitle>Analysis Error</AlertTitle>
                 <AlertDescription>{currentError}</AlertDescription>
               </Alert>
          );
      }
      // Only show result if not loading, no error, and result exists
      if (!showLoading && !currentError && result) {
          return (
              <Card className="mt-6 border-accent shadow-none">
                  <CardHeader>
                      <CardTitle className="text-xl">{titlePrefix} Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className={`border-l-4 p-4 rounded-none ${getConfidenceColor(result.confidenceScore)} bg-card`}>
                          <p className="text-sm font-medium text-foreground mb-1">Confidence Score:</p>
                          <p className={`text-4xl font-bold ${getConfidenceColor(result.confidenceScore).split(' ')[1]}`}>
                              {(result.confidenceScore * 100).toFixed(1)}%
                          </p>
                          <p className="text-sm mt-1">{getScoreLabel(result.confidenceScore)}</p>
                      </div>
                      <div>
                          <h4 className="font-semibold mb-1">Explanation:</h4>
                          <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-3 border border-border">
                              {result.explanation}
                          </p>
                      </div>
                  </CardContent>
              </Card>
          );
      }
      // Return null if loading, or if there's no result and no error after loading finishes
      return null;
  };

  // Chart configuration
  const chartConfig = {
    score: {
      label: "Confidence Score",
      color: "hsl(var(--chart-1))", // Use theme color
    },
  } satisfies ChartConfig; // Ensure it satisfies ChartConfig type

  return (
    <Card className="w-full border-primary shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2"><Video /> Video Deepfake Analysis</CardTitle>
        <CardDescription>Upload a video file or use your camera for live analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="file" className="flex items-center gap-2"><Upload className="w-4 h-4"/> Upload File</TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2"><Camera className="w-4 h-4"/> Live Stream</TabsTrigger>
          </TabsList>

          {/* File Upload Tab */}
          <TabsContent value="file" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="video-upload" className="text-lg font-medium">Upload Video File</Label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="flex-grow file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
                   aria-describedby="file-upload-error"
                />
                <Button
                  onClick={handleAnalyzeVideoFile}
                  disabled={!file || isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : <PixelAnalyzeIcon />}
                  Analyze Video
                </Button>
              </div>
               {error && <p id="file-upload-error" className="text-sm text-destructive mt-2">{error}</p>}
            </div>

            {videoUrl && !isLoading && ( // Only show video preview if not loading analysis
              <div className="mt-4 border border-border p-4 flex justify-center items-center bg-muted/50">
                <video
                  src={videoUrl}
                  controls
                  className="max-w-full max-h-[400px]"
                  data-ai-hint="uploaded video preview"
                />
              </div>
            )}
            {/* Render file analysis result using the common function */}
            {renderAnalysisResult(analysisResult, error, isLoading, "Video File")}
          </TabsContent>

          {/* Live Stream Tab */}
          <TabsContent value="live" className="space-y-6">
            <div className="flex flex-col items-center gap-4">
               {!isStreaming ? (
                 <Button onClick={startStreaming} className="w-full sm:w-auto">
                   <Camera className="mr-2"/> Start Camera & Live Analysis
                 </Button>
               ) : (
                 <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                     <Button onClick={stopStreaming} variant="destructive" className="w-full sm:w-auto">
                         <StopCircle className="mr-2"/> Stop Camera & Analysis
                     </Button>
                     {/* Manual analyze button (optional, since it's automatic now) */}
                     {/*
                     <Button
                         onClick={analyzeLiveFrame}
                         disabled={isLiveLoading || !isStreaming}
                         className="w-full sm:w-auto"
                         variant="secondary"
                      >
                         {isLiveLoading ? <Loader2 className="animate-spin mr-2" /> : <PixelAnalyzeIcon />}
                         Analyze Current Frame (Manual)
                     </Button>
                     */}
                 </div>
               )}
            </div>

             {/* Video element for live feed */}
             <div className="mt-4 border border-border p-1 flex justify-center items-center bg-black aspect-video">
                 <video
                     ref={videoRef}
                     muted // Mute local playback
                     autoPlay
                     playsInline
                     className="max-w-full max-h-[400px] w-auto transform scale-x-[-1]" // Flip horizontally for mirror effect
                     data-ai-hint="live camera feed"
                 />
             </div>

             {/* Placeholder/Instruction text when not streaming */}
             {!isStreaming && !liveError && (
                 <div className="text-center text-muted-foreground py-4">
                    Click "Start Camera & Live Analysis" to begin. Analysis will run automatically every few seconds.
                 </div>
             )}

            {/* Live Analysis Chart */}
            {isStreaming && frameAnalysisData.length > 1 && (
                 <Card className="mt-6 border-secondary shadow-none">
                    <CardHeader>
                       <CardTitle className="text-xl">Live Confidence Score Over Time</CardTitle>
                       <CardDescription>Tracks the deepfake confidence score during the live session.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ChartContainer config={chartConfig} className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <LineChart
                                data={frameAnalysisData}
                                margin={{ top: 5, right: 10, left: -25, bottom: 5 }} // Adjusted left margin
                             >
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                  dataKey="time"
                                  type="number"
                                  domain={['dataMin', 'dataMax']}
                                  tickFormatter={(unixTime) => format(new Date(unixTime), 'HH:mm:ss')} // Format time
                                  stroke="hsl(var(--foreground))"
                                  tick={{ fontSize: 10 }}
                                />
                                <YAxis
                                   domain={[0, 1]} // Score is between 0 and 1
                                   stroke="hsl(var(--foreground))"
                                   tick={{ fontSize: 10 }}
                                />
                                <RechartsTooltip
                                  content={<ChartTooltipContent indicator="line" />}
                                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                                  wrapperStyle={{ outline: 'none' }}
                                />
                                <Line
                                  dataKey="score"
                                  type="monotone"
                                  stroke="var(--color-score)" // Use chart config color
                                  strokeWidth={2}
                                  dot={false} // Hide dots for cleaner look
                                  isAnimationActive={false} // Disable animation for live data
                                />
                             </LineChart>
                          </ResponsiveContainer>
                       </ChartContainer>
                    </CardContent>
                 </Card>
            )}

            {/* Display latest live analysis result OR loading indicator OR error */}
            {/* The common render function handles error, and latest result display */}
            {renderAnalysisResult(liveAnalysisResult, liveError, isLiveLoading && !analysisIntervalRef.current, "Live Frame")}


            {/* Note about live analysis */}
             {isStreaming && (
                 <Alert variant="default" className="mt-4">
                    <AlertDescription>
                       Live analysis automatically processes frames every few seconds. The chart shows the confidence score history.
                       {isLiveLoading && !liveAnalysisResult && <span className="italic"> (Waiting for first analysis...)</span>}
                       {isLiveLoading && liveAnalysisResult && <span className="italic"> (Analyzing next frame...)</span>}
                    </AlertDescription>
                 </Alert>
             )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
