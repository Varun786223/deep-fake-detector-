"use client";

import type { ChangeEvent } from 'react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeDeepfakeVideo, type AnalyzeDeepfakeVideoOutput } from '@/ai/flows/analyze-deepfake-video';
import { analyzeDeepfake } from '@/ai/flows/analyze-deepfake'; // Import analyzeDeepfake
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Loader2, Video, Camera, StopCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the pixelated Analyze icon using SVG
const PixelAnalyzeIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M10 18v-4h4v4h-4zM6 14v-4h4v4H6zM14 14v-4h4v4h-4zM10 10V6h4v4h-4zM6 6V2h4v4H6zM14 6V2h4v4h-4zM2 22h20M2 2h20" />
  </svg>
);


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
  const [liveAnalysisResult, setLiveAnalysisResult] = useState<AnalyzeDeepfakeVideoOutput | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);

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
      // Placeholder: Add logic to continuously capture frames and send for analysis
      toast({ title: "Live Stream Started", description: "Camera feed is active."});
      // Start analysis loop (example, adjust timing as needed)
      // analyzeLiveFrame(); // Initial analysis
      // const intervalId = setInterval(analyzeLiveFrame, 10000); // Analyze every 10 seconds
      // return () => clearInterval(intervalId); // Cleanup on stop
    } catch (err) {
       console.error("Error accessing camera:", err);
       const errorMsg = err instanceof Error ? err.message : "Unknown error";
       setLiveError(`Could not access camera: ${errorMsg}. Please ensure permissions are granted.`);
       toast({ title: "Camera Error", description: `Could not access camera: ${errorMsg}`, variant: "destructive" });
       setIsStreaming(false);
    }
  };

   const stopStreaming = () => {
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
    toast({ title: "Live Stream Stopped", description: "Camera feed turned off." });
  };

  // Placeholder function for analyzing a single frame from the live stream
  const analyzeLiveFrame = useCallback(async () => {
      if (!videoRef.current || !isStreaming) return;

      setIsLiveLoading(true);
      setLiveError(null);

      try {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not get canvas context");

          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const frameDataUri = canvas.toDataURL('image/jpeg'); // Or 'image/png'

          // Use the *image* analysis flow for individual frames
          // NOTE: This might not be ideal for video; a dedicated video frame model is better.
          // Using the provided analyzeDeepfake (image) as a placeholder.
          const result = await analyzeDeepfake({ photoDataUri: frameDataUri });
          setLiveAnalysisResult({ confidenceScore: result.confidenceScore, explanation: result.analysisReport }); // Adapt output format
           toast({
             title: "Live Frame Analyzed",
             description: `Confidence: ${(result.confidenceScore * 100).toFixed(1)}%`,
           });
      } catch (err) {
          console.error("Live frame analysis failed:", err);
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          setLiveError(`Live analysis failed: ${errorMessage}`);
          // Don't show toast for every frame error, maybe aggregate or show once.
      } finally {
          setIsLiveLoading(false);
          // Optional: Schedule next analysis if still streaming
          // if (isStreaming) setTimeout(analyzeLiveFrame, 5000); // e.g., analyze every 5 seconds
      }
  }, [isStreaming, toast]);

   // Effect to stop stream on component unmount
  useEffect(() => {
    return () => {
      stopStreaming();
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

  const renderAnalysisResult = (result: AnalyzeDeepfakeVideoOutput | null, currentError: string | null, currentLoading: boolean, titlePrefix: string) => {
      if (currentLoading) {
          return (
              <div className="flex flex-col items-center justify-center space-y-2 pt-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analyzing {titlePrefix.toLowerCase()}...</p>
                  <Progress value={undefined} className="w-full h-2 animate-pulse" />
              </div>
          );
      }
      if (currentError) {
          return (
               <Alert variant="destructive" className="mt-4">
                 <AlertTitle>Analysis Error</AlertTitle>
                 <AlertDescription>{currentError}</AlertDescription>
               </Alert>
          );
      }
      if (result) {
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
      return null;
  };


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

            {videoUrl && (
              <div className="mt-4 border border-border p-4 flex justify-center items-center bg-muted/50">
                <video
                  src={videoUrl}
                  controls
                  className="max-w-full max-h-[400px]"
                  data-ai-hint="uploaded video preview"
                />
              </div>
            )}

            {renderAnalysisResult(analysisResult, error, isLoading, "Video File")}
          </TabsContent>

          {/* Live Stream Tab */}
          <TabsContent value="live" className="space-y-6">
            <div className="flex flex-col items-center gap-4">
               {!isStreaming ? (
                 <Button onClick={startStreaming} className="w-full sm:w-auto">
                   <Camera className="mr-2"/> Start Camera
                 </Button>
               ) : (
                 <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                     <Button onClick={stopStreaming} variant="destructive" className="w-full sm:w-auto">
                         <StopCircle className="mr-2"/> Stop Camera
                     </Button>
                     {/* Placeholder button for manual frame analysis */}
                     <Button
                         onClick={analyzeLiveFrame}
                         disabled={isLiveLoading}
                         className="w-full sm:w-auto"
                         variant="secondary"
                      >
                         {isLiveLoading ? <Loader2 className="animate-spin mr-2" /> : <PixelAnalyzeIcon />}
                         Analyze Current Frame
                     </Button>
                 </div>
               )}
            </div>

             {liveError && (
                  <Alert variant="destructive" className="mt-4">
                      <AlertTitle>Camera/Analysis Error</AlertTitle>
                      <AlertDescription>{liveError}</AlertDescription>
                  </Alert>
             )}


            {isStreaming && (
               <div className="mt-4 border border-border p-1 flex justify-center items-center bg-black">
                 <video
                   ref={videoRef}
                   muted // Mute local playback
                   autoPlay
                   playsInline
                   className="max-w-full max-h-[400px] w-auto transform scale-x-[-1]" // Flip horizontally for mirror effect
                   data-ai-hint="live camera feed"
                  />
               </div>
            )}
            {!isStreaming && !liveError && (
                 <div className="text-center text-muted-foreground p-8 border border-dashed border-border">
                    Click "Start Camera" to begin live deepfake analysis.
                 </div>
             )}


            {/* Display live analysis results */}
            {isStreaming && renderAnalysisResult(liveAnalysisResult, liveError, isLiveLoading, "Live Frame")}

            {/* Note about live analysis limitations */}
             {isStreaming && (
                 <Alert variant="default" className="mt-4">
                    <AlertDescription>
                        Live analysis currently processes individual frames. Continuous, real-time video analysis requires more advanced techniques and potentially different AI models. Click "Analyze Current Frame" for a snapshot analysis.
                    </AlertDescription>
                 </Alert>
             )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
