"use client";

import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "./ui/button";
import LocalTime from "./LocalTime";

interface ShareableResultCardProps {
  score: number;
  role: string;
  appName?: string;
  date: string;
}

const ShareableResultCard = ({
  score,
  role,
  appName = "Interview Coach",
  date,
}: ShareableResultCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = `${appName}-${role}-result.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* The actual card that gets rendered to image */}
      <div
        ref={cardRef}
        className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-dark-200 to-[#1C1C22] p-8 text-center shadow-2xl shrink-0 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]"
        style={{
          background: "linear-gradient(135deg, #1C1C22 0%, #17181F 100%)",
        }}
      >
        {/* Decorative ambient glow */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary-200/20 blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl"></div>

        <h2 className="z-10 text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 leading-none">
          {appName}
        </h2>

        <div className="z-10 my-4 sm:my-6 flex h-28 w-28 sm:h-32 sm:w-32 flex-col items-center justify-center rounded-full border-4 border-primary-200 bg-dark-100 shadow-lg shadow-primary-200/20">
          <span className="text-4xl font-bold text-primary-200">{score}</span>
          <span className="text-sm font-medium text-light-400">/100</span>
        </div>

        <h3 className="z-10 text-xl font-bold text-light-100 capitalize">
          {role} Interview
        </h3>

        <p className="z-10 mt-3 text-sm text-light-400 max-w-[80%] leading-relaxed">
          I successfully completed a mock interview and received detailed feedback.
        </p>

        <p className="z-10 mt-4 text-xs text-light-600 font-mono">
          <LocalTime date={date} />
        </p>
      </div>

      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="btn-secondary w-[300px] sm:w-[400px] flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
        </svg>
        {isExporting ? "Exporting..." : "Download Result Card"}
      </Button>
    </div>
  );
};

export default ShareableResultCard;
