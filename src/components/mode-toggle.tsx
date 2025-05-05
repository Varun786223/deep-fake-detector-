
"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Simple Pixel Sun SVG
const PixelSunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
    <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 2V0 M12 24v-2 M18 12h2 M4 12H2 M16 16l1 1 M7 7l-1-1 M16 8l1-1 M7 17l-1 1"/>
  </svg>
);

// Simple Pixel Moon SVG
const PixelMoonIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter">
   <path d="M12 2 A10 10 0 1 0 12 22 A8 8 0 1 1 12 2 z"/>
 </svg>
);


export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Ensure the component is mounted before rendering theme-dependent UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid rendering theme-dependent UI on the server or during initial client render
  if (!mounted) {
    // Render a placeholder or null to avoid hydration mismatch
    return (
        <Button
            variant="outline"
            size="icon"
            disabled // Disable until mounted
            className="border-primary hover:bg-primary/10"
            aria-label="Toggle theme (loading)"
        >
            <PixelSunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
            <span className="sr-only">Toggle theme</span>
         </Button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const ariaLabel = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;

  return (
     <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTheme}
                    className="border-primary hover:bg-primary/10" // Style button
                    aria-label={ariaLabel}
                >
                    <PixelSunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <PixelMoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                 </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Switch Theme</p>
            </TooltipContent>
        </Tooltip>
     </TooltipProvider>
  )
}
