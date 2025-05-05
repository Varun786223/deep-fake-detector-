
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Pixelated Icons
const PixelSettingsIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
   <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 2a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1z m0 18a1 1 0 0 1-1 1v1a1 1 0 0 1 2 0v-1a1 1 0 0 1-1-1z m6-7a1 1 0 0 1 1 1h1a1 1 0 0 1 0 2h-1a1 1 0 0 1-1-1z M5 12a1 1 0 0 1 1 1h1a1 1 0 0 1 0 2H6a1 1 0 0 1-1-1z m10-5a1 1 0 0 1 1 1l1 1a1 1 0 0 1-1 1l-1-1a1 1 0 0 1-1-1z M5 16a1 1 0 0 1 1 1l1 1a1 1 0 0 1-1 1l-1-1a1 1 0 0 1-1-1z m10-9a1 1 0 0 1 1 1l-1 1a1 1 0 0 1-1-1l1-1z M5 8a1 1 0 0 1 1 1l-1 1a1 1 0 0 1-1-1l1-1z"/>
 </svg>
);
const PixelSaveIcon = () => (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
   <path d="M4 4h16v16H4z m4 0v8h8V4z m0 12h8v4H8z"/>
 </svg>
);


interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { toast } = useToast();
  // Placeholder state for settings - load from localStorage or context in real app
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSave = () => {
    // In a real app, save these settings to localStorage or a user profile
    console.log("Saving settings:", { notificationsEnabled });
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
    onOpenChange(false); // Close dialog on save
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-accent">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 text-accent">
             <PixelSettingsIcon /> Application Settings
          </DialogTitle>
          <DialogDescription>
            Customize your experience. Changes are saved locally.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Example Setting: Notifications */}
          <div className="flex items-center justify-between space-x-4 px-1">
            <Label htmlFor="notifications-switch" className="text-base font-medium cursor-pointer">
              Enable Analysis Notifications
            </Label>
             <Switch
                id="notifications-switch"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                aria-label="Toggle analysis completion notifications"
              />
          </div>

          {/* Add more settings here */}
           <div className="flex items-center justify-between space-x-4 px-1 opacity-50">
             <Label htmlFor="placeholder-switch" className="text-base font-medium cursor-not-allowed">
               Another Setting (Disabled)
             </Label>
              <Switch
                 id="placeholder-switch"
                 disabled
                 aria-label="Placeholder setting (disabled)"
               />
           </div>

        </div>
        <DialogFooter>
           <Button type="button" onClick={handleSave} variant="default">
             <PixelSaveIcon /> Save Changes
           </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    