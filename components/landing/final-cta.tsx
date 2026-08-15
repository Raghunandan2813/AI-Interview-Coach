import { ArrowRight, ShieldCheck, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from './reveal'

export function FinalCta() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal y={28}>
          <div className="relative overflow-hidden rounded-3xl border border-border px-6 py-16 text-center sm:px-12 sm:py-20">
            {/* background */}
            <div aria-hidden="true" className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-background to-heat-200/15" />
              <div className="grid-texture absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
              <div className="absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
            </div>

            <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl md:leading-[1.1]">
              Ready to ace your{' '}
              <span className="gradient-text">next interview?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted-foreground text-pretty">
              Practice with realistic AI interviews and receive actionable feedback.
            </p>

            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 bg-gradient-to-r from-primary to-heat-200 px-7 text-base text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90"
              ><a href="/sign-up">
                Start Your Free Interview
                <ArrowRight className="size-4" />
              </a></Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-7 text-base"
              ><a href="#demo">
                <Play className="size-4" />
                View Demo
              </a></Button>
            </div>

            <p className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-400" />
              No credit card required
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
