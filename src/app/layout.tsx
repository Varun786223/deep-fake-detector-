import type {Metadata} from 'next';
import {VT323} from 'next/font/google'; // Import VT323 font
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

// Configure VT323 font
const vt323 = VT323({
  weight: '400', // VT323 only supports 400 weight
  subsets: ['latin'],
  variable: '--font-vt323', // Define CSS variable for the font
});

export const metadata: Metadata = {
  title: 'Deep Fake Detector', // Update title
  description: 'Analyze images and videos for deepfakes.', // Update description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the VT323 font variable */}
      <body className={`${vt323.variable} font-sans antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster for notifications */}
      </body>
    </html>
  );
}
