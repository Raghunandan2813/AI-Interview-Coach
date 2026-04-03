import type { Metadata } from "next";
import { Mona_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://interviewprep.app"),
  title: {
    default: "InterAI - AI Mock Interview Practice",
    template: "%s | InterAI",
  },
  description:
    "Practice AI-powered mock interviews, get detailed feedback, and track progress with performance analytics.",
  keywords: [
    "mock interview",
    "interview preparation",
    "AI interview",
    "coding interview practice",
    "interview feedback",
  ],
  openGraph: {
    title: "InterAI - AI Mock Interview Practice",
    description:
      "Practice AI-powered mock interviews, get detailed feedback, and improve faster.",
    type: "website",
    siteName: "InterAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterAI - AI Mock Interview Practice",
    description:
      "Practice AI-powered mock interviews, get detailed feedback, and improve faster.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/roboo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased  pattern`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
