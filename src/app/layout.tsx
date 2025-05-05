
import type {Metadata} from 'next';
import {VT323} from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { HeaderActions } from "@/components/header-actions"; // Import HeaderActions
import { OnboardingTutorial } from '@/components/onboarding-tutorial'; // Import Onboarding

// Configure VT323 font
const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
});

export const metadata: Metadata = {
  title: 'Deep Fake Detector',
  description: 'Analyze images and videos for deepfakes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${vt323.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
           {/* Render HeaderActions component */}
           <HeaderActions />
           {children}
           <Toaster />
           <OnboardingTutorial /> {/* Add Onboarding Tutorial */}
         </ThemeProvider>
      </body>
    </html>
  );
}

    