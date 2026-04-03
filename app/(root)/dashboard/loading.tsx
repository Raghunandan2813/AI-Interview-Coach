import React from "react";

export default function DashboardLoading() {
  return (
    <section className="flex flex-col gap-8 pb-10 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-56 rounded bg-white/10" />
        <div className="h-4 w-80 rounded bg-white/5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-28 rounded-2xl border border-white/10 bg-dark-200/50" />
        <div className="h-28 rounded-2xl border border-white/10 bg-dark-200/50" />
        <div className="h-28 rounded-2xl border border-white/10 bg-dark-200/50" />
      </div>

      <div className="h-72 rounded-2xl border border-white/10 bg-dark-200/50" />
      <div className="h-56 rounded-2xl border border-white/10 bg-dark-200/50" />
    </section>
  );
}
