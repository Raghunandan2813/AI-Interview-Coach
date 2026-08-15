import React from 'react'

export default function Loading() {
  return (
    <section className="flex flex-col gap-8 pb-10 animate-pulse">
      <div className="h-44 rounded-2xl border border-white/10 bg-dark-200/50" />

      <div className="space-y-4">
        <div className="h-7 w-44 rounded bg-white/10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-28 rounded-2xl border border-white/10 bg-dark-200/50" />
          <div className="h-28 rounded-2xl border border-white/10 bg-dark-200/50" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-7 w-64 rounded bg-white/10" />
        <div className="h-72 rounded-2xl border border-white/10 bg-dark-200/50" />
      </div>
    </section>
  )
}
