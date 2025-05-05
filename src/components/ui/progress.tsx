
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string; // Add prop for indicator styling
  }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-none bg-muted shadcn-progress-root", // Base styles
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
         "h-full w-full flex-1 bg-primary transition-all shadcn-progress-indicator", // Default indicator styles
         indicatorClassName // Apply custom indicator class
         )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

    