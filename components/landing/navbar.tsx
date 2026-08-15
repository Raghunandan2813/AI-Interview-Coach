'use client'

import { useEffect, useState } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/site-data'
import { Logo } from './logo'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border bg-background/70 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <a href="#top" className="rounded-lg focus-visible:outline-2 focus-visible:outline-ring">
          <Logo />
          <span className="sr-only">Interview Coach home</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
                asChild variant="ghost" size="lg"><a href="/sign-in">
            Sign In
          </a></Button>
          <Button
                asChild
            size="lg"
            className="bg-gradient-to-r from-primary to-heat-200 text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90"
          ><a href="/sign-up">
            Start Free Interview
            <ArrowRight className="size-4" />
          </a></Button>
        </div>

        <Button
          variant="outline"
          size="icon-lg"
          className="lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          'lg:hidden fixed inset-x-0 top-16 z-40 origin-top transition-all duration-300',
          open
            ? 'pointer-events-auto opacity-100 translate-y-0'
            : 'pointer-events-none -translate-y-2 opacity-0',
        )}
      >
        <div className="mx-4 mt-2 rounded-2xl border border-border bg-popover/95 p-4 shadow-2xl backdrop-blur-xl">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            <Button
                asChild variant="outline" size="lg"><a href="/sign-in" onClick={() => setOpen(false)}>
              Sign In
            </a></Button>
            <Button
                asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-heat-200 text-primary-foreground shadow-lg shadow-primary/25"
            ><a href="/sign-up" onClick={() => setOpen(false)}>
              Start Free Interview
              <ArrowRight className="size-4" />
            </a></Button>
          </div>
        </div>
      </div>
    </header>
  )
}
