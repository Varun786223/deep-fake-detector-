import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageAnalysis from "@/components/image-analysis";
import VideoAnalysis from "@/components/video-analysis";
import ReportDeepfake from "@/components/report-deepfake";
import LearnMore from "@/components/learn-more";
import { FileQuestion, Image as ImageIcon, Video, AlertTriangle } from "lucide-react"; // Import icons

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-12 lg:p-24 bg-background">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-primary">
          Deep Fake Detector
        </h1>

        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Image
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Report
            </TabsTrigger>
            <TabsTrigger value="learn" className="flex items-center gap-2">
               <FileQuestion className="w-5 h-5" />
              Learn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image">
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
      </div>
    </main>
  );
}
