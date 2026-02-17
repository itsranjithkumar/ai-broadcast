import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VoxReel - AI Voice & Text Video Generator",
  description: "Transform text into engaging voice-driven videos with AI. Create stunning short-form content in seconds.",
  keywords: ["AI video", "text to speech", "video generator", "short videos", "social media content"],
  themeColor: "#111827",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  openGraph: {
    title: "VoxReel - AI Voice & Text Video Generator",
    description: "Transform text into engaging voice-driven videos with AI. Create stunning short-form content in seconds.",
    type: "website",
    locale: "en_US",
    url: "https://voxreel.app",
    siteName: "VoxReel",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoxReel - AI Voice & Text Video Generator",
    description: "Transform text into engaging voice-driven videos with AI.",
    creator: "@voxreel",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-900">
      <body className={`${inter.className} h-full antialiased text-white bg-gray-900`}>
        <div className="min-h-full flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
