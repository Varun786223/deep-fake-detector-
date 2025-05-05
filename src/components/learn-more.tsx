
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components

// --- Pixelated SVG Icons ---

// Pixelated FileQuestion Icon
const PixelFileQuestionIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M4 2h10l6 6v14H4z M14 2v6h6 M12 12v0m0 4h.01 M12 16a1 1 0 0 0 -1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0 -1 -1"/>
  </svg>
);

// Pixelated Eye Icon
const PixelEyeIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
  </svg>
);

// Pixelated ShieldCheck Icon
const PixelShieldCheckIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M12 2l8 4v6c0 4-8 10-8 10S4 16 4 12V6l8-4z m-1 10l-3-3 1-1 2 2 4-4 1 1z"/>
 </svg>
);

// Pixelated Users Icon
const PixelUsersIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
   <path d="M7 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z m0 2c-4 0-7 3-7 7v2h14v-2c0-4-3-7-7-7z M17 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z m0 2c-1.7 0-3.2.9-4.2 2.3 M17 16c4 0 7 3 7 7v2h-6"/>
 </svg>
);

// Pixelated Link Icon
const PixelLinkIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
   <path d="M10 14H8v-2h2v-2h2v2h2v2h-2v2h-2v-2z M6 18H4v-6h2z M18 6h2v6h-2z M14 4h-4v2h4z M14 20h-4v2h4z M9 9l-3-3m12 12l-3-3"/>
 </svg>
);

export default function LearnMore() {
  return (
    <TooltipProvider>
      <Card className="w-full border-secondary">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-secondary">
            <PixelFileQuestionIcon /> Learn About Deepfakes
          </CardTitle>
          <CardDescription>Understand the technology, detection methods, impacts, and find resources.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue="what-are-deepfakes">
            {/* Section 1: What are Deepfakes? */}
            <AccordionItem value="what-are-deepfakes" className="border-secondary/50">
              <AccordionTrigger className="text-lg font-semibold hover:text-secondary focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
                <span className="flex items-center gap-2"><PixelEyeIcon /> What are Deepfakes?</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-base pl-4 border-l-2 border-secondary/50 ml-3">
                <p>
                  <strong>Deepfakes</strong> are synthetic media (images, videos, audio) created using artificial intelligence, particularly <strong className="text-secondary">deep learning</strong>.
                </p>
                <p>
                  They manipulate or generate content, making it seem like someone said or did something they never did. This is often achieved using models like Generative Adversarial Networks (GANs) trained on large datasets.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Section 2: How to Spot Deepfakes */}
            <AccordionItem value="how-to-spot" className="border-secondary/50">
              <AccordionTrigger className="text-lg font-semibold hover:text-secondary focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
                <span className="flex items-center gap-2"><PixelShieldCheckIcon /> How to Spot Them</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base pl-4 border-l-2 border-secondary/50 ml-3">
                <p className="font-medium text-foreground">Spotting deepfakes gets harder, but look for these clues:</p>
                <ul className="list-none pl-2 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">&#9632;</span> {/* Pixelated Square Bullet */}
                    <div><strong>Eyes & Blinking:</strong> Unnatural patterns (too much/little), lack of reflections.</div>
                  </li>
                   <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">&#9632;</span>
                    <div><strong>Facial Expressions:</strong> Stiff, limited, or mismatched emotions.</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">&#9632;</span>
                    <div><strong>Visual Glitches:</strong> Blurring at edges, mismatched skin tones/lighting, weird hair.</div>
                  </li>
                   <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">&#9632;</span>
                    <div><strong>Audio Sync:</strong> Lip movements don't perfectly match the sound.</div>
                  </li>
                   <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">&#9632;</span>
                    <div><strong>Artifacts:</strong> Blockiness or strange distortions, especially during movement.</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">&#9632;</span>
                    <div><strong>Lack of Detail:</strong> Overly smooth skin, missing pores or fine hairs.</div>
                  </li>
                </ul>
                <p className="mt-4 p-3 bg-muted/30 border border-border text-sm rounded-sm">
                  <strong className="text-destructive">Important:</strong> No single clue is definitive. Use critical thinking, check the source, and be skeptical of sensational content.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Section 3: Impacts and Concerns */}
            <AccordionItem value="impacts" className="border-secondary/50">
              <AccordionTrigger className="text-lg font-semibold hover:text-secondary focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
                 <span className="flex items-center gap-2"><PixelUsersIcon /> Impacts and Concerns</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-base pl-4 border-l-2 border-secondary/50 ml-3">
                <p className="font-medium text-foreground">Deepfakes pose serious risks:</p>
                 <ul className="list-none pl-2 space-y-2">
                   <li className="flex items-start gap-2">
                     <span className="text-destructive mt-1">&#9632;</span>
                     <div><strong>Disinformation:</strong> Spreading fake news, influencing elections.</div>
                   </li>
                    <li className="flex items-start gap-2">
                     <span className="text-destructive mt-1">&#9632;</span>
                     <div><strong>Malicious Content:</strong> Creating non-consensual explicit material, harassment.</div>
                   </li>
                    <li className="flex items-start gap-2">
                     <span className="text-destructive mt-1">&#9632;</span>
                     <div><strong>Fraud:</strong> Impersonation for financial scams or social engineering.</div>
                   </li>
                    <li className="flex items-start gap-2">
                     <span className="text-destructive mt-1">&#9632;</span>
                     <div><strong>Erosion of Trust:</strong> Making it hard to believe any digital media.</div>
                   </li>
                 </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Section 4: Further Resources */}
            <AccordionItem value="further-resources" className="border-b-0">
              <AccordionTrigger className="text-lg font-semibold hover:text-secondary focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
                <span className="flex items-center gap-2"><PixelLinkIcon /> Further Resources</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-base pl-4 border-l-2 border-secondary/50 ml-3">
                <p>Explore these external resources for more information:</p>
                <ul className="list-none pl-2 space-y-2">
                  <li className="flex items-start gap-2">
                     <span className="text-secondary mt-1">&#9632;</span>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <a href="https://www.stopdeepfakes.org/" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
                                StopDeepfakes.org
                            </a>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Visit StopDeepfakes.org (opens in new tab)</p>
                        </TooltipContent>
                     </Tooltip>
                  </li>
                  <li className="flex items-start gap-2">
                     <span className="text-secondary mt-1">&#9632;</span>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <a href="https://www.cisa.gov/stopransomware/understanding-deepfakes" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
                                CISA - Understanding Deepfakes
                            </a>
                        </TooltipTrigger>
                        <TooltipContent>
                             <p>Visit US CISA deepfake info (opens in new tab)</p>
                        </TooltipContent>
                     </Tooltip>
                  </li>
                  <li className="flex items-start gap-2">
                      <span className="text-secondary mt-1">&#9632;</span>
                     <Tooltip>
                         <TooltipTrigger asChild>
                            <a href="https://www.cyber.gc.ca/en/guidance/deepfakes-and-how-recognize-them-itsap00110" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
                                CCCS - Deepfakes Guide
                            </a>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>Visit Canadian Cyber Centre guide (opens in new tab)</p>
                         </TooltipContent>
                     </Tooltip>
                  </li>
                </ul>
                 <p className="text-xs text-muted-foreground mt-4">Note: External links open in a new tab. We are not responsible for the content of external sites.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

    