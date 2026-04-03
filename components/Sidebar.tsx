"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutDashboard, Mic, FileText, Gamepad2, Trophy, Rss } from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  { imgURL: Home, route: '/', label: 'Home' },
  { imgURL: LayoutDashboard, route: '/dashboard', label: 'Dashboard' },
  { imgURL: Mic, route: '/interview', label: 'Start Interview' },
  { imgURL: FileText, route: '/feedback', label: 'Feedbacks' },
  { imgURL: Gamepad2, route: '/quiz', label: 'Quiz' },
  { imgURL: Trophy, route: '/leaderboard', label: 'Leaderboard' },
]

type TechUpdate = {
  title: string
  link: string
  source: string
}

export default function Sidebar() {
  const pathname = usePathname()
  const [updates, setUpdates] = useState<TechUpdate[]>([])

  useEffect(() => {
    let mounted = true

    const loadUpdates = async () => {
      try {
        const response = await fetch('/api/tech-updates', { cache: 'no-store' })
        const data = await response.json()
        if (mounted) setUpdates(data.updates || [])
      } catch {
        if (mounted) setUpdates([])
      }
    }

    loadUpdates()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="hidden h-full w-[260px] flex-col justify-between py-10 px-6 max-md:hidden sm:flex border-r border-white/10 shrink-0 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      <div className="flex flex-1 flex-col gap-4">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.route || (pathname.startsWith(link.route) && link.route !== '/')

          const Icon = link.imgURL
          return (
            <Link
              href={link.route}
              key={link.label}
              className={cn(
                'flex gap-4 items-center p-3.5 rounded-xl justify-start font-semibold transition-all duration-200',
                {
                  'bg-primary-200 text-dark-100 shadow-[var(--shadow-glow)]': isActive,
                  'text-light-400 hover:text-white hover:bg-white/5': !isActive,
                }
              )}
            >
              <Icon size={20} className={isActive ? "text-dark-100" : "text-light-400"} />
              <p className={isActive ? "text-dark-100 font-bold" : "text-light-100"}>{link.label}</p>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Rss size={14} className="text-primary-200" />
          <p className="text-xs font-semibold uppercase tracking-wider text-light-400">Daily Tech Updates</p>
        </div>

        <div className="flex flex-col gap-2">
          {updates.length === 0 ? (
            <p className="text-xs text-light-600 leading-relaxed">No updates right now.</p>
          ) : (
            updates.slice(0, 5).map((item) => (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/10 bg-dark-200/40 px-2.5 py-2 hover:bg-white/5 transition-colors"
              >
                <p className="text-[11px] text-light-100 line-clamp-2 leading-4">{item.title}</p>
                <p className="text-[10px] text-light-600 mt-1">{item.source}</p>
              </a>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
