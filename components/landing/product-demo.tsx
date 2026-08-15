import {
  Download,
  TrendingUp,
  ThumbsUp,
  Lightbulb,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DASHBOARD } from '@/lib/site-data'
import { SectionHeading } from './section-heading'
import { Reveal } from './reveal'
import { TrendChart } from './trend-chart'

function ScoreRing({ score }: { score: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative grid size-32 place-items-center">
      <svg className="size-32 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--cyan)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-3xl font-semibold text-foreground">{score}</p>
        <p className="text-xs text-muted-foreground">/ 100</p>
      </div>
    </div>
  )
}

export function ProductDemo() {
  return (
    <section id="demo" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Product Demo"
          title="See Your Progress Like a Pro Dashboard"
          description="Every interview feeds a clean, actionable report — scores, trends, and a plan you can actually act on."
        />

        <Reveal delay={0.1} y={32}>
          <div className="mx-auto mt-14 max-w-5xl">
            {/* Browser frame */}
            <div className="glass-strong overflow-hidden rounded-2xl shadow-2xl">
              {/* top bar */}
              <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="size-3 rounded-full bg-destructive/70" />
                  <span className="size-3 rounded-full bg-amber-400/70" />
                  <span className="size-3 rounded-full bg-emerald-400/70" />
                </span>
                <div className="ml-3 hidden flex-1 items-center rounded-md border border-border bg-background/50 px-3 py-1 text-xs text-muted-foreground sm:flex">
                  app.interviewcoach.com/dashboard
                </div>
              </div>

              {/* dashboard body */}
              <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 lg:grid-cols-3">
                {/* overall score */}
                <div className="glass flex flex-col items-center justify-center gap-2 rounded-2xl p-6 text-center">
                  <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                  <ScoreRing score={DASHBOARD.overallScore} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    <TrendingUp className="size-3.5" /> Up 21 pts in 6 sessions
                  </span>
                </div>

                {/* metrics */}
                <div className="glass flex flex-col gap-4 rounded-2xl p-6 lg:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Score Breakdown</p>
                  <ul className="flex flex-col gap-4">
                    {DASHBOARD.metrics.map((m) => (
                      <li key={m.label}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="text-foreground">{m.label}</span>
                          <span className="font-medium text-muted-foreground">{m.value}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-heat-200"
                            style={{ width: `${m.value}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* trend chart */}
                <div className="glass flex flex-col gap-2 rounded-2xl p-6 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Performance Trend</p>
                    <span className="text-xs text-muted-foreground">Last 6 sessions</span>
                  </div>
                  <TrendChart />
                </div>

                {/* recent sessions */}
                <div className="glass flex flex-col gap-3 rounded-2xl p-6">
                  <p className="text-sm font-medium text-muted-foreground">Recent Sessions</p>
                  <ul className="flex flex-col gap-2">
                    {DASHBOARD.sessions.map((s) => (
                      <li
                        key={s.role}
                        className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5"
                      >
                        <div className="leading-tight">
                          <p className="text-sm text-foreground">{s.role}</p>
                          <p className="text-xs text-muted-foreground">{s.date}</p>
                        </div>
                        <span className="font-display text-sm font-semibold gradient-text">
                          {s.score}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* strengths */}
                <div className="glass flex flex-col gap-3 rounded-2xl p-6">
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <ThumbsUp className="size-4 text-emerald-400" /> Strengths
                  </p>
                  <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {DASHBOARD.strengths.map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* improvements */}
                <div className="glass flex flex-col gap-3 rounded-2xl p-6">
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <Lightbulb className="size-4 text-amber-400" /> Areas to Improve
                  </p>
                  <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {DASHBOARD.improvements.map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-400" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI recommendation */}
                <div className="border-gradient flex flex-col justify-between gap-4 rounded-2xl p-6">
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      <Sparkles className="size-4 text-primary-200" /> AI Recommendation
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Focus your next 2 sessions on quantifying impact and cutting filler
                      words to push past 85.
                    </p>
                  </div>
                  <a
                    href="/sign-up"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-200 hover:underline"
                  >
                    Start focused session <ChevronRight className="size-4" />
                  </a>
                </div>
              </div>

              {/* footer action */}
              <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-secondary/30 px-6 py-4 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  Generated feedback report · Frontend Developer track
                </p>
                <Button
                asChild
                  className="bg-gradient-to-r from-primary to-heat-200 text-primary-foreground hover:opacity-90"
                  size="lg"
                ><a href="/sign-up">
                  <Download className="size-4" />
                  Download Feedback Report
                </a></Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
