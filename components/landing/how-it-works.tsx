import { STEPS } from '@/lib/site-data'
import { SectionHeading } from './section-heading'
import { StaggerGroup, StaggerItem } from './reveal'

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 size-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How It Works"
          title="From Setup to Confident in Three Steps"
          description="No lengthy onboarding. Start a realistic interview in under a minute and improve from your very first session."
        />

        <div className="relative mt-16">
          {/* connecting line (desktop) */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />
          <StaggerGroup className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
            {STEPS.map((step) => (
              <StaggerItem key={step.number}>
                <div className="relative flex flex-col items-start">
                  <div className="relative z-10 grid size-16 place-items-center rounded-2xl border border-border bg-card font-display text-xl font-semibold text-foreground shadow-lg">
                    <span className="gradient-text">{step.number}</span>
                    <span className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/20 to-heat-200/10 blur-md" />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  )
}
