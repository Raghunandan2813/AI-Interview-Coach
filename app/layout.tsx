import type { Metadata } from "next";
import { Mona_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

// Every number in Arena — scores, timers, ranks, streaks — is set in mono with
// tabular figures so digits hold their column instead of jittering as they
// count up.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://interviewprep.app"),
  title: {
    default: "Interview Coach - AI Mock Interview Practice",
    template: "%s | Interview Coach",
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
    title: "Interview Coach - AI Mock Interview Practice",
    description:
      "Practice AI-powered mock interviews, get detailed feedback, and improve faster.",
    type: "website",
    siteName: "Interview Coach",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interview Coach - AI Mock Interview Practice",
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
      <body
        className={`${monaSans.variable} ${geistMono.variable} ${monaSans.className} antialiased`}
      >
        {children}
        <Toaster theme="dark" richColors position="top-center" />
      </body>
    </html>
  );
}
