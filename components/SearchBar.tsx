"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getLatestInterviews } from '@/lib/action/general.action'

export default function SearchBar({ currentUserId }: { currentUserId?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('query') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [interviews, setInterviews] = useState<any[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  
  // Fetch interviews for fast client-side filtering
  useEffect(() => {
    if (currentUserId) {
      getLatestInterviews({ userId: currentUserId, limit: 100 }).then((data) => {
        if (data) setInterviews(data)
      })
    }
  }, [currentUserId])

  // Sync external query changes
  useEffect(() => {
    setQuery(searchParams.get('query') || '')
  }, [searchParams])

  // Debounce URL typing search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Avoid pushing if they clicked a suggestion and are no longer focused
      if (isFocused && query !== (searchParams.get('query') || '')) {
         if (query.trim()) {
           router.replace(`/?query=${encodeURIComponent(query.trim())}`)
         } else if (searchParams.has('query')) {
           router.replace('/')
         }
      }
    }, 400)
    return () => clearTimeout(delayDebounceFn)
  }, [query, router, searchParams, isFocused])

  // Handle clicking outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredInterviews = interviews.filter((interview) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    const matchRole = interview.role?.toLowerCase().includes(q);
    const matchTech = interview.techstack?.some((t: string) => t.toLowerCase().includes(q));
    return matchRole || matchTech;
  }).slice(0, 5); // show top 5 suggestions

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md flex mx-2 sm:mx-4 flex-col z-50">
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-400" size={16} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search generated interviews by role or tech stack..." 
          className="w-full bg-dark-200/80 border border-white/10 rounded-xl h-10 pl-10 pr-4 text-sm text-light-100 focus:outline-none focus:border-primary-200/50 hover:bg-dark-200 transition-all placeholder:text-light-600 shadow-sm"
        />
      </div>

      {isFocused && query.trim() && filteredInterviews.length > 0 && (
        <div className="absolute top-12 left-0 w-full bg-dark-200 border border-white/10 rounded-xl shadow-[var(--shadow-soft)] overflow-hidden flex flex-col p-2 animate-in fade-in zoom-in-95 duration-200">
          {filteredInterviews.map((interview) => (
            <div 
              key={interview.id} 
              onClick={() => {
                setQuery(interview.role);
                setIsFocused(false);
                router.push(`/interview/${interview.id}`);
              }}
              className="flex flex-col gap-1.5 p-3 hover:bg-white/5 cursor-pointer rounded-lg transition-colors border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-2">
                <Search size={14} className="text-primary-200" />
                <span className="text-light-100 text-sm font-semibold">{interview.role}</span>
              </div>
              <div className="flex items-center gap-2 pl-5">
                <span className="text-light-400 text-xs px-2 py-0.5 border border-white/10 rounded-md uppercase tracking-wider font-medium">
                  {interview.type}
                </span>
                <span className="text-light-600 text-xs font-medium">
                  • {interview.level} Level
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
