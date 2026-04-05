import React from "react";
import { Sparkles, Bot, FileText } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-10 animate-pulse">
      {/* Hero Header Skeleton */}
      <div className="flex flex-col gap-3">
        <div className="h-7 w-28 bg-dark-200/50 rounded-full" />
        <div className="h-12 w-3/4 max-w-lg bg-dark-200/50 rounded-xl" />
        <div className="h-6 w-full max-w-2xl bg-dark-200/50 rounded-lg mt-2" />
        <div className="h-6 w-2/3 max-w-xl bg-dark-200/50 rounded-lg" />
      </div>

      {/* Bento Grid layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-[600px] w-full mt-4">
        {/* Left Bento */}
        <div className="rounded-[32px] border border-white/5 bg-dark-200/20" />
        {/* Right Bento */}
        <div className="rounded-[32px] border border-white/5 bg-dark-200/20" />
      </div>
    </div>
  );
}
