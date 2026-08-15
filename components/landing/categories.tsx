import { ArrowUpRight } from 'lucide-react'
import { CATEGORIES } from '@/lib/site-data'
import { SectionHeading } from './section-heading'
import { StaggerGroup, StaggerItem } from './reveal'

export function Categories() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Interview Categories"
          title="Practise for the Interview You're Actually Facing"
          description="Pick a specialised track or bring your own job description for a fully custom interview."
        />

        <StaggerGroup className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <StaggerItem key={cat.title}>
                <a
                  href="#pricing"
                  className="group glass flex h-full flex-col gap-4 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-heat-200/10 ring-1 ring-inset ring-border">
                      <Icon className="size-5 text-primary-200" />
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{cat.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{cat.count}</p>
                  </div>
                </a>
              </StaggerItem>
            )
          })}
        </StaggerGroup>

        <div className="mt-10 flex justify-center">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary/70"
          >
            Explore Interviews
            <ArrowUpRight className="size-4 text-primary-200" />
          </a>
        </div>
      </div>
    </section>
  )
}
