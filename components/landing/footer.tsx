'use client'

import { useState } from 'react'
import { AtSign, Link, Code, Play, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FOOTER_COLUMNS } from '@/lib/site-data'
import { Logo } from './logo'

const SOCIALS = [
  { label: 'X / Twitter', href: '#', icon: AtSign },
  { label: 'LinkedIn', href: '#', icon: Link },
  { label: 'GitHub', href: '#', icon: Code },
  { label: 'YouTube', href: '#', icon: Play },
]

export function Footer() {
  const [subscribed, setSubscribed] = useState(false)

  return (
    <footer className="relative border-t border-border bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          {/* brand + newsletter */}
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Your personal AI interview coach. Practise realistic interviews, get instant
              feedback, and walk in ready.
            </p>

            <form
              className="mt-6 max-w-xs"
              onSubmit={(e) => {
                e.preventDefault()
                setSubscribed(true)
              }}
            >
              <label htmlFor="newsletter" className="text-sm font-medium text-foreground">
                Interview tips, monthly
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="newsletter"
                  type="email"
                  required
                  placeholder="you@email.com"
                  className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                />
                <Button
                  type="submit"
                  size="icon-lg"
                  aria-label="Subscribe to newsletter"
                  className="shrink-0 bg-gradient-to-r from-primary to-heat-200 text-primary-foreground"
                >
                  {subscribed ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
                </Button>
              </div>
              {subscribed && (
                <p className="mt-2 text-xs text-emerald-400">Thanks — you're subscribed!</p>
              )}
            </form>
          </div>

          {/* link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Interview Coach. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              All systems operational
            </span>
            <ul className="flex items-center gap-3">
              {SOCIALS.map((s) => {
                const Icon = s.icon
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      aria-label={s.label}
                      className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
