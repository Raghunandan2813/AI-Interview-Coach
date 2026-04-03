import React from "react";

export default function LeaderboardLoading() {
  return (
    <section className="w-full max-w-5xl mx-auto flex flex-col gap-8 animate-pulse">
      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="h-16 w-16 rounded-full bg-white/10" />
        <div className="h-10 w-72 rounded bg-white/10" />
        <div className="h-4 w-96 rounded bg-white/5" />
      </div>

      <div className="h-56 rounded-2xl border border-white/10 bg-dark-200/50" />
      <div className="h-[420px] rounded-3xl border border-white/10 bg-dark-200/50" />
    </section>
  );
}
