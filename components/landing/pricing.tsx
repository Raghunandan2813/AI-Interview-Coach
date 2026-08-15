import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PLANS } from '@/lib/site-data'
import { SectionHeading } from './section-heading'
import { StaggerGroup, StaggerItem } from './reveal'

export function Pricing() {
  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple Plans That Grow With Your Search"
          description="Start free, upgrade when you're serious. Cancel anytime — no credit card required to begin."
        />

        <StaggerGroup className="mx-auto mt-14 grid max-w-5xl grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <StaggerItem key={plan.name} className="h-full">
              <div
                className={cn(
                  'relative flex h-full flex-col rounded-2xl p-6',
                  plan.highlighted
                    ? 'border-gradient glow-primary md:-mt-4 md:mb-4'
                    : 'glass',
                )}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-heat-200 px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                    {plan.badge}
                  </span>
                )}

                <h3 className="font-display text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-semibold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/ {plan.period}</span>
                </div>

                <Button
                asChild
                  size="lg"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  className={cn(
                    'mt-6 h-11',
                    plan.highlighted &&
                      'bg-gradient-to-r from-primary to-heat-200 text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90',
                  )}
                ><a href="/sign-up">
                  {plan.cta}
                </a></Button>

                <ul className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15">
                        <Check className="size-3 text-primary-200" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
