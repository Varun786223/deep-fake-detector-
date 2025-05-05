
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageAnalysis from "@/components/image-analysis";
import VideoAnalysis from "@/components/video-analysis";
import ReportDeepfake from "@/components/report-deepfake";
import LearnMore from "@/components/learn-more";

// --- Pixelated SVG Icons --- (Only for titles now)

// Pixelated Image Icon
const PixelImageIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M4 4h16v12H4z m4 4h8v4H8z M6 6h2v2H6z"/>
  </svg>
);

// Pixelated Video Icon
const PixelVideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M4 4h16v12H4z m0 12l4-4H4z m16 0l-4-4h4z M8 8h2v2H8z M14 8h2v2h-2z M8 14h8" />
  </svg>
);

// Pixelated AlertTriangle Icon
const PixelAlertTriangleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M2 20h20L12 4 2 20zm10-12v4m0 4v2" />
  </svg>
);

// Pixelated FileQuestion Icon
const PixelFileQuestionIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M4 2h10l6 6v14H4z M14 2v6h6 M12 12v0m0 4h.01 M12 16a1 1 0 0 0 -1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0 -1 -1"/>
  </svg>
);


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 lg:p-16 bg-background">
      {/* Added padding for smaller screens and adjusted larger screen padding */}
      <div className="w-full max-w-4xl">
        {/* Consider adding a logo or thematic graphic here */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-8 md:mb-10 text-primary drop-shadow-md">
          Deep Fake Detector
        </h1>

        <Tabs defaultValue="image" className="w-full">
          {/* Simplified TabsList - removed redundant icons within triggers */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 shadcn-tabs-list">
            <TabsTrigger value="image" className="shadcn-tabs-trigger" aria-label="Image Analysis Tab">
              {/* Icon can be added here if needed, but keeping it clean */}
              Image
            </TabsTrigger>
            <TabsTrigger value="video" className="shadcn-tabs-trigger" aria-label="Video Analysis Tab">
              Video
            </TabsTrigger>
            <TabsTrigger value="report" className="shadcn-tabs-trigger" aria-label="Report Deepfake Tab">
              Report
            </TabsTrigger>
            <TabsTrigger value="learn" className="shadcn-tabs-trigger" aria-label="Learn More Tab">
              Learn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image">
            {/* Pass icon to component if needed, or keep icons within components */}
            <ImageAnalysis />
          </TabsContent>
          <TabsContent value="video">
            <VideoAnalysis />
          </TabsContent>
          <TabsContent value="report">
            <ReportDeepfake />
          </TabsContent>
          <TabsContent value="learn">
            <LearnMore />
          </TabsContent>
        </Tabs>

         {/* Optional: Footer with links or disclaimer */}
         <footer className="mt-12 text-center text-xs text-muted-foreground">
           <p>&copy; {new Date().getFullYear()} Deep Fake Detector. For educational and awareness purposes only.</p>
           {/* Add privacy policy/terms links if applicable */}
         </footer>
      </div>
       {/* Consider adding onboarding/tutorial component trigger here */}
       {/* <OnboardingTutorial /> */}
    </main>
  );
}
