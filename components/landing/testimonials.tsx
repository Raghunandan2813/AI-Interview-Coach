import Image from 'next/image'
import { Star, BadgeCheck } from 'lucide-react'
import { TESTIMONIALS } from '@/lib/site-data'
import { SectionHeading } from './section-heading'
import { StaggerGroup, StaggerItem } from './reveal'

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="Candidates Who Practised and Showed Up Ready"
          description="Real preparation leads to clearer answers and calmer nerves. Here's what practising with Interview Coach felt like."
        />

        <StaggerGroup className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="glass flex h-full flex-col gap-5 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-200">
                    <BadgeCheck className="size-4" />
                    Verified
                  </span>
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-foreground text-pretty">
                  {t.quote}
                </blockquote>
                <figcaption className="flex items-center gap-3 border-t border-border pt-4">
                  <Image
                    src={t.avatar || '/placeholder.svg'}
                    alt={`${t.name}'s profile photo`}
                    width={44}
                    height={44}
                    className="size-11 rounded-full object-cover"
                  />
                  <div className="leading-tight">
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
