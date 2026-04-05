import React from "react";
import { Gamepad2, Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full pt-10 pb-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-200/30 bg-primary-200/10 w-fit mb-2">
          <Sparkles size={16} className="text-primary-200" />
          <span className="text-sm font-semibold text-primary-200 uppercase tracking-wider">Quiz Challenge</span>
        </div>
        <div className="h-10 w-3/4 max-w-sm bg-dark-200/50 rounded-xl" />
        <div className="h-5 w-full max-w-md bg-dark-200/50 rounded-lg mt-2" />
      </div>

      {/* Main card skeleton */}
      <div className="w-full bg-dark-200/30 border border-white/5 rounded-3xl p-8 md:p-12 h-[450px]">
        <div className="flex justify-between items-center mb-10">
          <div className="h-6 w-24 bg-dark-300/50 rounded-lg" />
          <div className="h-8 w-24 bg-dark-300/50 rounded-full" />
          <div className="h-6 w-24 bg-dark-300/50 rounded-lg" />
        </div>
        
        <div className="h-16 w-full bg-dark-300/50 rounded-xl mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-16 w-full bg-dark-300/30 rounded-xl" />
          <div className="h-16 w-full bg-dark-300/30 rounded-xl" />
          <div className="h-16 w-full bg-dark-300/30 rounded-xl" />
          <div className="h-16 w-full bg-dark-300/30 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
