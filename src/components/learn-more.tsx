import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileQuestion, Eye, ShieldCheck, Users } from 'lucide-react';

export default function LearnMore() {
  return (
    <Card className="w-full border-secondary shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2"><FileQuestion /> Learn About Deepfakes</CardTitle>
        <CardDescription>Understand what deepfakes are, how they're made, and how to spot them.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-are-deepfakes">
            <AccordionTrigger className="text-lg font-semibold">
              <span className="flex items-center gap-2"><Eye className="w-5 h-5" /> What are Deepfakes?</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 text-base pl-2 border-l-2 border-secondary ml-3">
              <p>
                Deepfakes are synthetic media (images, videos, or audio) created using artificial intelligence, specifically deep learning techniques. They manipulate or generate content to make it appear as if someone said or did something they never actually did.
              </p>
              <p>
                The technology often uses Generative Adversarial Networks (GANs) or other machine learning models trained on large datasets of real images, videos, or audio recordings.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-to-spot">
            <AccordionTrigger className="text-lg font-semibold">
              <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> How to Spot Deepfakes</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base pl-2 border-l-2 border-secondary ml-3">
              <p>Spotting deepfakes can be challenging as the technology improves, but here are some potential indicators:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Unnatural Eye Movements:</strong> Look for unusual blinking patterns (too much, too little, or unsynchronized) or strange reflections in the eyes.</li>
                <li><strong>Awkward Facial Expressions:</strong> Expressions might seem stiff, limited, or don't match the context of the speech/audio.</li>
                <li><strong>Visual Inconsistencies:</strong> Check for blurring or distortion around the edges of the face, mismatched skin tones, or unnatural hair rendering.</li>
                <li><strong>Audio/Video Sync Issues:</strong> The audio might not perfectly align with lip movements.</li>
                <li><strong>Unusual Lighting or Shadows:</strong> Lighting on the face might not match the rest of the scene.</li>
                 <li><strong>Pixelation or Artifacts:</strong> Noticeable blockiness or strange artifacts, especially during movement or around manipulated areas.</li>
                 <li><strong>Lack of Detail:</strong> Sometimes, fine details like individual hair strands or skin pores might look smoothed over or synthetic.</li>
              </ul>
              <p><strong>Important:</strong> Not all indicators will be present, and some real media might exhibit similar flaws. Use critical thinking and consider the source of the media.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="impacts">
            <AccordionTrigger className="text-lg font-semibold">
               <span className="flex items-center gap-2"><Users className="w-5 h-5" /> Impacts and Concerns</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 text-base pl-2 border-l-2 border-secondary ml-3">
              <p>
                Deepfakes raise significant concerns due to their potential for misuse:
              </p>
               <ul className="list-disc pl-6 space-y-2">
                 <li><strong>Disinformation and Propaganda:</strong> Spreading false narratives, influencing public opinion, or interfering in politics.</li>
                 <li><strong>Non-consensual Pornography:</strong> Creating fake explicit content featuring individuals without their consent.</li>
                 <li><strong>Fraud and Impersonation:</strong> Impersonating individuals for financial gain or social engineering attacks.</li>
                 <li><strong>Erosion of Trust:</strong> Making it harder to believe what we see and hear online, undermining trust in media and institutions.</li>
                 <li><strong>Harassment and Bullying:</strong> Creating malicious content to target and harm individuals.</li>
               </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="further-resources">
            <AccordionTrigger className="text-lg font-semibold">Further Resources</AccordionTrigger>
            <AccordionContent className="space-y-2 text-base pl-2 border-l-2 border-secondary ml-3">
              <p>For more in-depth information, consider exploring resources from organizations focused on media literacy, AI ethics, and cybersecurity.</p>
              <ul className="list-disc pl-6 space-y-2">
                 <li><a href="https://www.stopdeepfakes.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">StopDeepfakes.org</a> (Example resource)</li>
                 <li><a href="https://www.cybersecurity.gov/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Cybersecurity & Infrastructure Security Agency (CISA)</a> (General cyber awareness)</li>
                 {/* Add more relevant links */}
              </ul>
               <p className="text-sm text-muted-foreground">Note: External links are provided for informational purposes. We do not endorse or control the content of external sites.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
