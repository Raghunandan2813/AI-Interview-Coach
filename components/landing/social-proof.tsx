import { PREP_COMPANIES } from '@/lib/site-data'
import { Reveal } from './reveal'

export function SocialProof() {
  return (
    <section className="border-y border-border/60 bg-background/40 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Built for candidates targeting top companies
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:gap-x-14">
            {PREP_COMPANIES.map((company) => (
              <li
                key={company}
                className="font-display text-xl font-semibold tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground sm:text-2xl"
              >
                {company}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
