
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

// Pixelated Icons (Simplified versions for tutorial)
const PixelImageIcon = () => (
 <svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M5 3h14v14H5z m2 2v10h10V5zm2 2h6v6H9z m2 2h2v2h-2z"/></svg>
);
const PixelVideoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v12H4zm13 13l3 3h-3zM4 17l3-3H4zm4-9h2v2H8zm6 0h2v2h-2zm-6 5h8v2H8z"/></svg>
);
const PixelAlertIcon = () => (
 <svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M1 21h22L12 2zm11-3h-2v-2h2zm0-4h-2V7h2z"/></svg>
);
const PixelLearnIcon = () => (
 <svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M6 2h12v20H6zm2 2v16h8V4zm2 2h4v2H10zm0 4h4v2H10zm0 4h2v2H10zm3 0h1v2h-1z"/></svg>
);
const PixelArrowRight = () => (
 <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
);
const PixelCheckIcon = () => (
 <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.41 1.41L9 19 21 7l-1.41-1.41z"/></svg>
);

const TUTORIAL_STORAGE_KEY = 'deepfake_tutorial_completed_v1';

export function OnboardingTutorial() {
  const [open, setOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  useEffect(() => {
    // Check if tutorial was already completed
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!completed) {
      // Delay opening slightly to allow page render
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!api) return;

    setSlideCount(api.scrollSnapList().length);
    setCurrentSlide(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  const handleComplete = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setOpen(false);
  };

  const handleNext = () => {
    if (api) api.scrollNext();
  };

  const isLastSlide = currentSlide === slideCount - 1;

  // Prevent dialog closing by overlay click or escape key during tutorial
  const onInteractOutside = (e: Event) => {
    e.preventDefault();
  };
  const onEscapeKeyDown = (e: KeyboardEvent) => {
     e.preventDefault();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[550px] p-0 border-primary"
        onInteractOutside={onInteractOutside}
        onEscapeKeyDown={onEscapeKeyDown}
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-description"
        >
        <DialogHeader className="p-6 pb-2">
          <DialogTitle id="tutorial-title" className="text-2xl text-primary">Welcome to Deepfake Detector!</DialogTitle>
          <DialogDescription id="tutorial-description" className="text-base">
            A quick guide to get you started.
          </DialogDescription>
        </DialogHeader>
        <Carousel setApi={setApi} className="w-full px-4 pb-4">
          <CarouselContent>
            <CarouselItem>
              <div className="p-4 space-y-4 text-center">
                <div className="flex justify-center text-primary"><PixelImageIcon /></div>
                <h3 className="text-lg font-semibold">Image Analysis</h3>
                <p className="text-muted-foreground">Upload an image to check for general deepfake signs or specific face swaps. Get a confidence score and detailed report.</p>
              </div>
            </CarouselItem>
            <CarouselItem>
               <div className="p-4 space-y-4 text-center">
                <div className="flex justify-center text-primary"><PixelVideoIcon /></div>
                <h3 className="text-lg font-semibold">Video Analysis</h3>
                <p className="text-muted-foreground">Analyze an uploaded video file or use your webcam for live, frame-by-frame analysis, including face swap detection and a confidence trend chart.</p>
              </div>
            </CarouselItem>
            <CarouselItem>
               <div className="p-4 space-y-4 text-center">
                <div className="flex justify-center text-destructive"><PixelAlertIcon /></div>
                <h3 className="text-lg font-semibold">Report Deepfakes</h3>
                <p className="text-muted-foreground">Found suspicious content online? Use the Report tab to submit details and help combat the spread of harmful deepfakes.</p>
              </div>
            </CarouselItem>
             <CarouselItem>
               <div className="p-4 space-y-4 text-center">
                <div className="flex justify-center text-secondary"><PixelLearnIcon /></div>
                <h3 className="text-lg font-semibold">Learn More</h3>
                <p className="text-muted-foreground">Visit the Learn tab to understand what deepfakes are, how to spot them, their impacts, and find links to external resources.</p>
              </div>
            </CarouselItem>
             <CarouselItem>
               <div className="p-4 space-y-4 text-center">
                <div className="flex justify-center text-primary scale-150"><PixelCheckIcon /></div>
                <h3 className="text-lg font-semibold">You're Ready!</h3>
                <p className="text-muted-foreground">Explore the tabs and start analyzing. Remember to be critical of online media!</p>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-2">
            {Array.from({ length: slideCount }).map((_, index) => (
              <span
                key={index}
                className={`block h-2 w-2 rounded-full ${
                  index === currentSlide ? 'bg-primary' : 'bg-muted'
                }`}
                aria-current={index === currentSlide}
                aria-label={`Slide ${index + 1} of ${slideCount}`}
              />
            ))}
           </div>
          <CarouselPrevious className="left-2 disabled:opacity-30" />
          <CarouselNext className="right-2 disabled:opacity-30" />
        </Carousel>
        <DialogFooter className="p-4 pt-0 flex flex-row justify-end sm:justify-end">
            {isLastSlide ? (
               <Button onClick={handleComplete} variant="default" size="sm">
                 <PixelCheckIcon /> Got It!
               </Button>
             ) : (
               <Button onClick={handleNext} variant="secondary" size="sm">
                 Next <PixelArrowRight />
               </Button>
             )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    