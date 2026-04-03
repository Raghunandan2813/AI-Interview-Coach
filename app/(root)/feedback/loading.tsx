import React from "react";

export default function FeedbackLoading() {
  return (
    <section className="flex flex-col gap-8 pb-10 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-64 rounded bg-white/10" />
        <div className="h-4 w-96 rounded bg-white/5" />
      </div>

      <div className="space-y-4 mt-2">
        <div className="h-28 rounded-2xl border border-white/10 bg-dark-200/50" />
        <div className="h-28 rounded-2xl border border-white/10 bg-dark-200/50" />
        <div className="h-28 rounded-2xl border border-white/10 bg-dark-200/50" />
      </div>
    </section>
  );
}
