import React from 'react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[60vh] gap-5 animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-primary-200/20 blur-xl rounded-full w-16 h-16"></div>
        <div className="w-12 h-12 border-[4px] border-white/10 border-t-primary-200 rounded-full animate-spin relative z-10"></div>
      </div>
      <p className="text-light-600 font-medium tracking-widest text-sm uppercase animate-pulse">Loading Workspace</p>
    </div>
  )
}
