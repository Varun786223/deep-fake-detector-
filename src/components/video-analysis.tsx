
"use client";

import type { ChangeEvent } from 'react';
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { analyzeDeepfakeVideo, type AnalyzeDeepfakeVideoOutput } from '@/ai/flows/analyze-deepfake-video';
import { analyzeDeepfake, type AnalyzeDeepfakeOutput as AnalyzeDeepfakeImageOutput } from '@/ai/flows/analyze-deepfake'; // For general frame analysis
import { detectFaceSwap, type DetectFaceSwapOutput } from '@/ai/flows/detect-face-swap'; // For face swap detection
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Loader2, Video, Camera, StopCircle, ScanSearch, Replace } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select component
// Import chart components
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

// Define the pixelated Analyze icon using SVG
const PixelAnalyzeIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M10 18v-4h4v4h-4zM6 14v-4h4v4H6zM14 14v-4h4v4h-4zM10 10V6h4v4h-4zM6 6V2h4v4H6zM14 6V2h4v4h-4zM2 22h20M2 2h20" />
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
    { value: '10s', label: 'Last 10 Seconds', durationMs: 10 * 1000 },
    { value: '30s', label: 'Last 30 Seconds', durationMs: 30 * 1000 },
    { value: '1m', label: 'Last 1 Minute', durationMs: 60 * 1000 },
    { value: 'all', label: 'All Time' },
];

export default function VideoAnalysis() {
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDeepfakeVideoOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Live stream state
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [liveDeepfakeResult, setLiveDeepfakeResult] = useState<DisplayDeepfakeResult | null>(null);
  const [liveFaceSwapResult, setLiveFaceSwapResult] = useState<DetectFaceSwapOutput | null>(null);
  const [isLiveAnalysisLoading, setIsLiveAnalysisLoading] = useState<boolean>(false); // Combined loading state for live
  const [liveError, setLiveError] = useState<string | null>(null);
  const [frameAnalysisData, setFrameAnalysisData] = useState<FrameAnalysisPoint[]>([]);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [chartTimeRange, setChartTimeRange] = useState<ChartTimeRangeOption>('all'); // Default to show all data

  const { toast } = useToast();

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
        videoRef.current.play().catch(console.error);
      }
      setIsStreaming(true);
      toast({ title: "Live Stream Started", description: "Camera feed is active."});
      analysisIntervalRef.current = setInterval(() => {
        analyzeLiveFrame();
      }, 3000); // Analyze every 3 seconds
      setFrameAnalysisData([]); // Reset chart data
      setLiveDeepfakeResult(null); // Clear previous results
      setLiveFaceSwapResult(null); // Clear previous results
    } catch (err) {
       console.error("Error accessing camera:", err);
       const errorMsg = err instanceof Error ? err.message : "Unknown error";
       setLiveError(`Could not access camera: ${errorMsg}. Please ensure permissions are granted.`);
       toast({ title: "Camera Error", description: `Could not access camera: ${errorMsg}`, variant: "destructive" });
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
    setIsLiveAnalysisLoading(false);
    setLiveDeepfakeResult(null);
    setLiveFaceSwapResult(null);
    setLiveError(null);
    // Keep frameAnalysisData for viewing history after stopping
    toast({ title: "Live Stream Stopped", description: "Camera feed turned off." });
  };

  // Analyze a single live frame for both general deepfake and face swap
  const analyzeLiveFrame = useCallback(async () => {
      if (!videoRef.current || !isStreaming || isLiveAnalysisLoading) return;

      setIsLiveAnalysisLoading(true);
      setLiveError(null);

      try {
          const canvas = document.createElement('canvas');
          const scale = 0.5;
          canvas.width = videoRef.current.videoWidth * scale;
          canvas.height = videoRef.current.videoHeight * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not get canvas context");

          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const frameDataUri = canvas.toDataURL('image/jpeg', 0.8);

          // Run both analyses in parallel
          const [deepfakeResult, faceSwapResult] = await Promise.all([
              analyzeDeepfake({ photoDataUri: frameDataUri }).catch(err => {
                  console.error("General deepfake analysis failed:", err);
                  return { error: err, type: 'deepfake' }; // Return error object
              }),
              detectFaceSwap({ photoDataUri: frameDataUri }).catch(err => {
                  console.error("Face swap detection failed:", err);
                  return { error: err, type: 'faceswap' }; // Return error object
              })
          ]);

          let currentError = null;

          // Process deepfake result
          if ('error' in deepfakeResult) {
              currentError = `General analysis failed: ${deepfakeResult.error instanceof Error ? deepfakeResult.error.message : "Unknown error"}`;
              setLiveDeepfakeResult(null); // Clear previous result on error
          } else {
              const displayResult: DisplayDeepfakeResult = {
                  confidenceScore: deepfakeResult.confidenceScore,
                  explanation: deepfakeResult.analysisReport
              };
              setLiveDeepfakeResult(displayResult);
              // Add general deepfake score to chart data
              setFrameAnalysisData((prevData) => [
                ...prevData,
                { time: Date.now(), score: deepfakeResult.confidenceScore },
              ]);
          }

          // Process face swap result
          if ('error' in faceSwapResult) {
              const faceSwapError = `Face swap detection failed: ${faceSwapResult.error instanceof Error ? faceSwapResult.error.message : "Unknown error"}`;
              currentError = currentError ? `${currentError}; ${faceSwapError}` : faceSwapError;
              setLiveFaceSwapResult(null); // Clear previous result on error
          } else {
              setLiveFaceSwapResult(faceSwapResult);
          }

          if(currentError) {
            setLiveError(currentError);
            // Optionally toast the combined error
            // toast({ title: "Live Analysis Error(s)", description: currentError, variant: "destructive" });
          }

      } catch (err) {
          console.error("Live frame capture/processing failed:", err);
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          setLiveError(`Live analysis failed: ${errorMessage}`);
      } finally {
          setIsLiveAnalysisLoading(false);
      }
  }, [isStreaming, isLiveAnalysisLoading, toast]); // Added toast

   // Effect to stop stream and clear interval on component unmount
  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      stopStreaming();
    };
  }, []);

  // --- Common Result Display Logic ---
  const getConfidenceColor = (score: number): string => {
    if (score > 0.7) return 'border-destructive text-destructive'; // Red
    if (score > 0.4) return 'border-accent text-accent'; // Pink
    return 'border-primary text-primary'; // Green
  };

  const getScoreLabel = (score: number, context: 'deepfake' | 'faceswap'): string => {
    const highLabel = context === 'faceswap' ? 'High Confidence (Likely Face Swap)' : 'High Confidence (Likely Deepfake)';
    const lowLabel = context === 'faceswap' ? 'Low Confidence (Likely No Face Swap)' : 'Low Confidence (Likely Real)';
    if (score > 0.7) return highLabel;
    if (score > 0.4) return 'Medium Confidence';
    return lowLabel;
  }

  // Render general deepfake result (used for file upload and live stream)
  const renderDeepfakeResult = (
    result: DisplayDeepfakeResult | null,
    titlePrefix: string,
    titleColor: string = 'text-accent', // Default to accent (pink)
    borderColor: string = 'border-accent' // Default to accent (pink)
  ) => {
      if (!result) return null;
      return (
          <Card className={`mt-6 ${borderColor}`}>
              <CardHeader>
                  <CardTitle className={`text-xl ${titleColor}`}>{titlePrefix} Deepfake Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className={`border-l-4 p-4 rounded-none ${getConfidenceColor(result.confidenceScore)} bg-card`}>
                      <p className="text-sm font-medium text-foreground mb-1">Confidence Score:</p>
                      <p className={`text-4xl font-bold ${getConfidenceColor(result.confidenceScore).split(' ')[1]}`}>
                          {(result.confidenceScore * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm mt-1">{getScoreLabel(result.confidenceScore, 'deepfake')}</p>
                  </div>
                  <div>
                      <h4 className="font-semibold mb-1">Explanation / Report:</h4>
                      <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-3 border border-border">
                          {result.explanation}
                      </p>
                  </div>
              </CardContent>
          </Card>
      );
  };

    // Render face swap detection result (only for live stream)
    const renderFaceSwapResult = (result: DetectFaceSwapOutput | null) => {
        if (!result) return null;
        return (
            <Card className="mt-6 border-secondary"> {/* Use secondary border (cyan) */}
                <CardHeader>
                    <CardTitle className="text-xl text-secondary">Live Frame Face Swap Detection Results</CardTitle> {/* Secondary color title */}
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant={result.isFaceSwapDetected ? "destructive" : "default"} className="rounded-none">
                        <AlertTitle className="flex items-center gap-2">
                            {result.isFaceSwapDetected ? <Replace className="text-destructive" /> : <ScanSearch />}
                            Detection Status
                        </AlertTitle>
                        <AlertDescription>
                            {result.isFaceSwapDetected
                                ? `A potential face swap was detected with ${ (result.confidenceScore * 100).toFixed(1)}% confidence.`
                                : `No clear face swap detected (Confidence: ${(result.confidenceScore * 100).toFixed(1)}%).`
                            }
                        </AlertDescription>
                    </Alert>
                    <div className={`border-l-4 p-4 rounded-none ${getConfidenceColor(result.confidenceScore)} bg-card`}>
                        <p className="text-sm font-medium text-foreground mb-1">Confidence Score:</p>
                        <p className={`text-4xl font-bold ${getConfidenceColor(result.confidenceScore).split(' ')[1]}`}>
                            {(result.confidenceScore * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm mt-1">{getScoreLabel(result.confidenceScore, 'faceswap')}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-1">Reasoning:</h4>
                        <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-3 border border-border">
                            {result.reasoning}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    };


  // Chart configuration using theme variables
  const chartConfig = {
    score: {
      label: "Confidence Score",
      color: "hsl(var(--chart-1))", // Use chart-1 (Bright Green)
    },
  } satisfies ChartConfig;

  // Filter chart data based on selected time range
  const filteredChartData = useMemo(() => {
    const selectedOption = timeRangeOptions.find(opt => opt.value === chartTimeRange);
    if (!selectedOption || !selectedOption.durationMs) {
      return frameAnalysisData; // 'all' or invalid selection
    }
    const now = Date.now();
    const cutoffTime = now - selectedOption.durationMs;
    return frameAnalysisData.filter(point => point.time >= cutoffTime);
  }, [frameAnalysisData, chartTimeRange]);


  return (
    <Card className="w-full border-primary"> {/* Primary border */}
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2 text-primary"><Video /> Video Deepfake Analysis</CardTitle> {/* Primary color title */}
        <CardDescription>Upload a video file or use your camera for live analysis (general deepfake and face swap).</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 shadcn-tabs-list"> {/* Added class */}
            <TabsTrigger value="file" className="flex items-center gap-2 shadcn-tabs-trigger"><Upload className="w-4 h-4"/> Upload File</TabsTrigger> {/* Added class */}
            <TabsTrigger value="live" className="flex items-center gap-2 shadcn-tabs-trigger"><Camera className="w-4 h-4"/> Live Stream</TabsTrigger> {/* Added class */}
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
                  variant="secondary" // Cyan button
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : <PixelAnalyzeIcon />}
                  Analyze Video (File)
                </Button>
              </div>
               {error && <p id="file-upload-error" className="text-sm text-destructive mt-2">{error}</p>}
            </div>

            {videoUrl && !isLoading && (
              <div className="mt-4 border border-border p-4 flex justify-center items-center bg-muted/50">
                <video
                  src={videoUrl}
                  controls
                  className="max-w-full max-h-[400px]"
                  data-ai-hint="uploaded video preview"
                />
              </div>
            )}

            {/* Loading indicator for file upload */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-2 pt-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analyzing video file...</p>
                  <Progress value={undefined} className="w-full h-2 animate-pulse" />
              </div>
            )}
            {/* Render file analysis result - Use Primary color for file results */}
            {!isLoading && analysisResult && renderDeepfakeResult(analysisResult, "Video File", "text-primary", "border-primary")}
          </TabsContent>

          {/* Live Stream Tab */}
          <TabsContent value="live" className="space-y-6">
            <div className="flex flex-col items-center gap-4">
               {!isStreaming ? (
                 <Button onClick={startStreaming} className="w-full sm:w-auto" variant="secondary"> {/* Cyan Button */}
                   <Camera className="mr-2"/> Start Camera & Live Analysis
                 </Button>
               ) : (
                 <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                     <Button onClick={stopStreaming} variant="destructive" className="w-full sm:w-auto">
                         <StopCircle className="mr-2"/> Stop Camera & Analysis
                     </Button>
                 </div>
               )}
            </div>

             {/* Video element for live feed */}
             <div className="mt-4 border border-border p-1 flex justify-center items-center bg-black aspect-video">
                 <video
                     ref={videoRef}
                     muted
                     autoPlay
                     playsInline
                     className="max-w-full max-h-[400px] w-auto transform scale-x-[-1]"
                     data-ai-hint="live camera feed"
                 />
             </div>

             {!isStreaming && !liveError && (
                 <div className="text-center text-muted-foreground py-4">
                    Click "Start Camera & Live Analysis" to begin. Frames will be analyzed periodically for general deepfakes and face swaps.
                 </div>
             )}

             {/* Live Analysis Loading/Error/Results */}
             {isLiveAnalysisLoading && (
                 <div className="flex items-center justify-center space-x-2 pt-2 text-muted-foreground">
                     <Loader2 className="h-4 w-4 animate-spin" />
                     <span>Analyzing frame...</span>
                 </div>
             )}
             {liveError && !isLiveAnalysisLoading && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Live Analysis Error</AlertTitle>
                    <AlertDescription>{liveError}</AlertDescription>
                  </Alert>
             )}
             {!isLiveAnalysisLoading && (
                <>
                    {/* Render live deepfake result with default accent colors (pink) */}
                    {renderDeepfakeResult(liveDeepfakeResult, "Live Frame")}
                    {/* Render live face swap result (uses secondary/cyan internally) */}
                    {renderFaceSwapResult(liveFaceSwapResult)}
                </>
             )}


            {/* Live Analysis Chart */}
            {(isStreaming || (!isStreaming && frameAnalysisData.length > 0)) && ( // Show chart if streaming or if data exists after stopping
                 <Card className="mt-6 border-primary"> {/* Primary border for chart card */}
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <div className="space-y-1.5">
                            <CardTitle className="text-xl text-primary">Live Confidence Score Over Time</CardTitle> {/* Primary color title */}
                            <CardDescription>Tracks the general deepfake confidence score during the live session.</CardDescription>
                        </div>
                        {/* Time Range Selector */}
                        <div className="w-[150px]">
                            <Select value={chartTimeRange} onValueChange={(value) => setChartTimeRange(value as ChartTimeRangeOption)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time range" />
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
                    <CardContent>
                       {filteredChartData.length > 1 ? (
                           <ChartContainer config={chartConfig} className="h-[200px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                 <LineChart
                                    data={filteredChartData}
                                    margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                                 >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" /> {/* Dimmed border */}
                                    <XAxis
                                      dataKey="time"
                                      type="number"
                                      domain={['dataMin', 'dataMax']}
                                      tickFormatter={(unixTime) => format(new Date(unixTime), 'HH:mm:ss')}
                                      stroke="hsl(var(--foreground))"
                                      tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }} // Ensure tick text is visible
                                    />
                                    <YAxis
                                       domain={[0, 1]}
                                       stroke="hsl(var(--foreground))"
                                       tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }} // Ensure tick text is visible
                                       label={{ value: 'Confidence', angle: -90, position: 'insideLeft', offset: -15, style: { textAnchor: 'middle', fontSize: '10px', fill: 'hsl(var(--foreground))' } }} // Ensure label is visible
                                    />
                                    <RechartsTooltip
                                      content={<ChartTooltipContent indicator="line" labelFormatter={(value, payload) => payload && payload[0] ? format(new Date(payload[0].payload.time), 'HH:mm:ss') : ''} />}
                                      cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                                      wrapperStyle={{ outline: 'none' }} // Style tooltip via CSS layers
                                      itemStyle={{ color: 'hsl(var(--popover-foreground))'}} // Ensure tooltip item text visible
                                      labelStyle={{ color: 'hsl(var(--popover-foreground))'}} // Ensure tooltip label visible
                                    />
                                    <Line
                                      dataKey="score"
                                      type="monotone"
                                      stroke="var(--color-score)" // Uses chartConfig color (green)
                                      strokeWidth={2}
                                      dot={false}
                                      isAnimationActive={false}
                                    />
                                 </LineChart>
                              </ResponsiveContainer>
                           </ChartContainer>
                       ) : (
                           <div className="text-center text-muted-foreground py-8">
                               {isStreaming ? "Waiting for more data points to display chart..." : "No historical data to display."}
                           </div>
                       )}
                    </CardContent>
                 </Card>
            )}

            {/* Note about live analysis */}
             {isStreaming && (
                 <Alert variant="default" className="mt-4">
                    <AlertDescription>
                       Live analysis automatically processes frames every few seconds. The chart shows the confidence score history. Select a time range to focus the chart view.
                    </AlertDescription>
                 </Alert>
             )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
