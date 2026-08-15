"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, LayoutDashboard, Mic, FileText, Gamepad2, Rss, Trophy,
  ArrowUpRight, Plus, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type TechUpdate = {
  title: string
  link: string
  source: string
  pubDate?: string
}

const STORAGE_KEY = 'sidebar-collapsed'

// Grouped rather than one flat list: "do a thing" and "review a thing" are
// different intents, and the labels make the rail scannable instead of a
// column of six equal-weight links.
const groups = [
  {
    label: 'Practice',
    links: [
      { icon: Home, route: '/home', label: 'Home' },
      { icon: Mic, route: '/interview', label: 'Interview' },
      { icon: Gamepad2, route: '/quiz', label: 'Quiz' },
    ],
  },
  {
    label: 'Progress',
    links: [
      { icon: LayoutDashboard, route: '/dashboard', label: 'Dashboard' },
      { icon: FileText, route: '/feedback', label: 'Reports' },
      { icon: Trophy, route: '/leaderboard', label: 'Ranking' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  // Width only animates after mount, so a restored collapsed state doesn't
  // play a slide-in on every page load.
  const [mounted, setMounted] = useState(false)
  const [updates, setUpdates] = useState<TechUpdate[]>([])
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(true)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') setCollapsed(true)
    } catch {
      /* private mode — just start expanded */
    }
    setMounted(true)
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  useEffect(() => {
    let cancelled = false

    fetch('/api/tech-updates')
      .then((res) => (res.ok ? res.json() : { updates: [] }))
      .then((data) => {
        if (!cancelled) setUpdates(data.updates ?? [])
      })
      .catch(() => {
        if (!cancelled) setUpdates([])
      })
      .finally(() => {
        if (!cancelled) setIsLoadingUpdates(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <aside
      className={cn(
        'relative hidden sm:flex flex-col shrink-0 h-full',
        'border-r border-white/10 bg-dark-100/50 backdrop-blur-xl',
        collapsed ? 'w-[78px]' : 'w-[268px]',
        mounted && 'transition-[width] duration-300 ease-out',
      )}
    >
      {/* accent seam down the border */}
      <span className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary-200/40 to-transparent" />

      {/* collapse handle, sitting on the seam */}
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
        className="absolute -right-3.5 top-7 z-50 flex size-7 items-center justify-center rounded-full
                   border border-white/15 bg-dark-300 text-light-400
                   shadow-[var(--shadow-soft)] transition-all duration-200
                   hover:text-dark-100 hover:bg-primary-200 hover:border-primary-200 hover:scale-110
                   focus-visible:outline-2 focus-visible:outline-primary-200"
      >
        {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
      </button>

      <div className="flex flex-col h-full overflow-y-auto no-scrollbar py-6 px-3.5">
        <div className="flex flex-1 flex-col gap-6">

          {/* primary action — never buried in the list */}
          <Link
            href="/interview"
            title={collapsed ? 'New session' : undefined}
            className={cn(
              'group/cta relative flex items-center gap-3 rounded-2xl overflow-hidden shrink-0',
              'border border-primary-200/30 bg-primary-200/10',
              'transition-all duration-200 hover:border-primary-200/60 hover:bg-primary-200/15',
              collapsed ? 'justify-center p-2.5' : 'p-3',
            )}
          >
            <span className="absolute inset-0 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-300 heat-gradient mix-blend-overlay" />
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-200 text-dark-100 shadow-[var(--shadow-glow)]">
              <Plus size={18} strokeWidth={3} />
            </span>
            {!collapsed && (
              <span className="relative flex flex-col min-w-0">
                <span className="text-sm font-extrabold uppercase tracking-wide text-light-100 truncate">
                  New session
                </span>
                <span className="text-[11px] text-light-500 truncate">Build an interview</span>
              </span>
            )}
          </Link>

          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1.5">
              {collapsed ? (
                <span className="mx-auto mb-1 h-px w-7 bg-white/10" />
              ) : (
                <p className="eyebrow px-2 mb-1">{group.label}</p>
              )}

              {group.links.map((link) => {
                const isActive =
                  pathname === link.route ||
                  (pathname.startsWith(link.route) && link.route !== '/')
                const Icon = link.icon

                return (
                  <Link
                    href={link.route}
                    key={link.label}
                    className={cn(
                      'group/nav relative flex items-center gap-3 rounded-xl py-2.5',
                      'text-sm font-bold transition-all duration-200',
                      collapsed ? 'justify-center px-0' : 'pl-2.5 pr-3',
                      isActive
                        ? 'bg-white/[0.07] text-light-100'
                        : 'text-light-400 hover:text-light-100 hover:bg-white/[0.04]',
                    )}
                  >
                    {isActive && (
                      <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary-200 shadow-[var(--shadow-glow)]" />
                    )}

                    {/* the icon tile is what carries the active state when collapsed */}
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-primary-200 text-dark-100 shadow-[var(--shadow-glow)]'
                          : 'bg-white/[0.05] text-light-600 group-hover/nav:text-primary-200 group-hover/nav:bg-white/[0.08]',
                      )}
                    >
                      <Icon size={16} strokeWidth={2.5} />
                    </span>

                    {!collapsed && (
                      <span className="uppercase tracking-wide truncate">{link.label}</span>
                    )}

                    {/* hover label, since the collapsed rail is icons only */}
                    {collapsed && (
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg
                                   border border-white/10 bg-dark-300 px-2.5 py-1.5
                                   text-xs font-bold uppercase tracking-wide text-light-100
                                   opacity-0 translate-x-1 shadow-[var(--shadow-soft)]
                                   transition-all duration-150
                                   group-hover/nav:opacity-100 group-hover/nav:translate-x-0"
                      >
                        {link.label}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* the feed is detail — it earns its space only when expanded */}
        {collapsed ? (
          <div className="mt-6 pt-5 border-t border-white/10 flex justify-center">
            <button
              type="button"
              onClick={toggle}
              aria-label="Expand sidebar to see the tech feed"
              className="flex size-9 items-center justify-center rounded-lg bg-white/[0.05] text-light-600
                         transition-colors hover:text-heat-200 hover:bg-white/[0.08]"
            >
              <Rss size={15} />
            </button>
          </div>
        ) : (
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Rss size={13} className="text-heat-200" />
              <p className="eyebrow">Tech feed</p>
            </div>

            <div className="flex flex-col gap-1.5">
              {isLoadingUpdates ? (
                [0, 1, 2].map((i) => (
                  <div key={i} className="h-11 rounded-xl bg-white/[0.04] animate-pulse" />
                ))
              ) : updates.length === 0 ? (
                <p className="text-xs text-light-600 leading-relaxed px-1">
                  Nothing new right now.
                </p>
              ) : (
                updates.slice(0, 4).map((item) => (
                  <a
                    key={item.link}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/feed rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-2
                               transition-all hover:bg-white/[0.06] hover:border-primary-200/25"
                  >
                    <p className="text-[11px] text-light-300 line-clamp-2 leading-4 transition-colors group-hover/feed:text-light-100">
                      {item.title}
                    </p>
                    <p className="flex items-center gap-1 text-[10px] text-light-600 mt-1">
                      {item.source}
                      <ArrowUpRight
                        size={10}
                        className="opacity-0 transition-opacity group-hover/feed:opacity-100"
                      />
                    </p>
                  </a>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
