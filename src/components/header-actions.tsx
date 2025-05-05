
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { SettingsDialog } from '@/components/settings-dialog'; // Assuming settings dialog exists
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Pixel Settings Icon
const PixelSettingsIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
   {/* Gear Shape */}
   <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/> {/* Center circle */}
   {/* Teeth */}
   <path d="M12 2v2 M12 20v2 M16.95 4.05l-1.41 1.41 M8.46 15.54l-1.41 1.41 M20 12h-2 M6 12H4 M19.95 16.95l-1.41-1.41 M8.46 8.46l-1.41-1.41"/>
 </svg>
);

export function HeaderActions() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
        {/* Settings Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="border-primary hover:bg-primary/10"
              aria-label="Open settings dialog"
            >
              <PixelSettingsIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>

        {/* Theme Toggle Button */}
        <ModeToggle />

        {/* Settings Dialog */}
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </TooltipProvider>
  );
}

    