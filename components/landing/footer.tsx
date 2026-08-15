import { Linkedin, Github, Youtube, Twitter } from 'lucide-react'
import {
  FOOTER_COLUMNS,
  SOCIAL_LINKS,
  PORTFOLIO_URL,
  AUTHOR_NAME,
} from '@/lib/site-data'
import { Logo } from './logo'

const SOCIAL_ICONS = {
  LinkedIn: Linkedin,
  GitHub: Github,
  YouTube: Youtube,
  X: Twitter,
} as const

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">

        {/* brand + link columns */}
        <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-6">

          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
              Your AI-powered interview coach for smarter practice, personalized
              feedback, and confident performance.
            </p>

            <ul className="mt-6 flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => {
                const Icon = SOCIAL_ICONS[social.label]
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground
                                 transition-colors hover:border-primary/40 hover:text-foreground
                                 focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

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

        {/* bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-border pt-6 text-center
                        sm:mt-12 md:flex-row md:justify-between md:gap-4 md:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Interview Coach. All rights reserved.
          </p>

          <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-4">
            <p className="text-sm text-muted-foreground">
              Designed and developed by{' '}
              <a
                href={PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline decoration-primary/40 underline-offset-4
                           transition-colors hover:text-primary-200 hover:decoration-primary"
              >
                {AUTHOR_NAME}
              </a>
            </p>
            <span aria-hidden className="hidden text-muted-foreground/40 sm:inline">·</span>
            <p className="text-sm text-muted-foreground">
              Made with <span className="text-heat-200">❤</span> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
