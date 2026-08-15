import { FEATURES } from '@/lib/site-data'
import { SectionHeading } from './section-heading'
import { StaggerGroup, StaggerItem } from './reveal'

export function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything You Need to Master Your Next Interview"
          description="A complete practice toolkit that turns nervous preparation into a repeatable, measurable routine."
        />

        <StaggerGroup className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <StaggerItem key={feature.title}>
                <article className="group glass relative flex h-full flex-col gap-4 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                  <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-heat-200/10 ring-1 ring-inset ring-border transition-colors group-hover:ring-primary/40">
                    <Icon className="size-6 text-primary-200" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      </div>
    </section>
  )
}
