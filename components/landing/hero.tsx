import Image from 'next/image'
import { Sparkles, Play, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from './reveal'
import { InterviewPreview } from './interview-preview'

const HERO_AVATARS = [
  '/avatars/priya.png',
  '/avatars/marcus.png',
  '/avatars/candidate-4.png',
  '/avatars/candidate-5.png',
]

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 md:pb-24">
      {/* background texture + glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-texture absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="absolute -top-40 left-1/4 size-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -top-20 right-0 size-[30rem] rounded-full bg-heat-200/15 blur-[120px]" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        {/* Left */}
        <div className="flex flex-col items-start">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3.5 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="size-4 text-primary-200" />
              Your personal AI interview coach
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl md:leading-[1.05]">
              Practise Smarter. Interview Better.{' '}
              <span className="gradient-text">Get Hired.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
              Run realistic AI voice interviews, get personalized feedback the moment
              you finish, and track your improvement session after session — so you walk
              in prepared and confident.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 bg-gradient-to-r from-primary to-heat-200 px-6 text-base text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90"
              ><a href="/sign-up">
                Start Your Free Interview
                <ArrowRight className="size-4" />
              </a></Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-6 text-base"
              ><a href="#demo">
                <Play className="size-4" />
                Watch Demo
              </a></Button>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {HERO_AVATARS.map((src) => (
                    <Image
                      key={src}
                      src={src || '/placeholder.svg'}
                      alt=""
                      width={36}
                      height={36}
                      className="size-9 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Trusted by{' '}
                  <span className="font-semibold text-foreground">2,000+</span> ambitious
                  candidates
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-400" />
                No credit card required
              </span>
            </div>
          </Reveal>
        </div>

        {/* Right */}
        <Reveal delay={0.2} y={28} className="w-full">
          <InterviewPreview />
        </Reveal>
      </div>
    </section>
  )
}
