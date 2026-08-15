import { Check, X, ArrowRight, Sparkles } from 'lucide-react'
import { BENEFITS, BEFORE_AFTER } from '@/lib/site-data'
import { Reveal } from './reveal'

export function Benefits() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left: copy */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Why Interview Coach
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Turn Interview Anxiety Into{' '}
              <span className="gradient-text">Confidence</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground text-pretty">
              Repetition in a safe space is what builds real confidence. Interview Coach gives you
              unlimited reps, honest feedback, and a clear view of your progress.
            </p>
          </Reveal>

          <ul className="mt-8 flex flex-col gap-3.5">
            {BENEFITS.map((benefit, i) => (
              <Reveal as="li" key={benefit} delay={0.12 + i * 0.05}>
                <span className="flex items-center gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-heat-200">
                    <Check className="size-3.5 text-primary-foreground" />
                  </span>
                  <span className="text-sm text-foreground sm:text-base">{benefit}</span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* Right: before / after */}
        <Reveal delay={0.15} y={28}>
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_70%_30%,color-mix(in_oklch,var(--cyan)_30%,transparent),transparent_70%)] blur-2xl"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* before */}
              <div className="glass rounded-2xl p-5">
                <p className="text-sm font-medium text-muted-foreground">
                  {BEFORE_AFTER.before.label}
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {BEFORE_AFTER.before.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <X className="mt-0.5 size-4 shrink-0 text-destructive/80" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* after */}
              <div className="border-gradient glow-primary rounded-2xl p-5">
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Sparkles className="size-4 text-primary-200" />
                  {BEFORE_AFTER.after.label}
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {BEFORE_AFTER.after.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* transformation arrow */}
            <div className="mt-4 flex items-center justify-center gap-2 rounded-full border border-border bg-secondary/40 py-2 text-sm text-muted-foreground">
              Interview-ready in a few focused sessions
              <ArrowRight className="size-4 text-primary-200" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
