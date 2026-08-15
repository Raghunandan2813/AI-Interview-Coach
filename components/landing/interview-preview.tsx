'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Mic, Sparkles, TrendingUp, CheckCircle2, Circle } from 'lucide-react'

const WAVE_BARS = [0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 1, 0.55, 0.75, 0.45, 0.85, 0.65, 0.95, 0.5]

function Waveform() {
  const reduceMotion = useReducedMotion()
  return (
    <div className="flex h-10 items-center gap-[3px]" aria-hidden="true">
      {WAVE_BARS.map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-primary to-heat-200"
          style={{
            height: `${h * 100}%`,
            animation: reduceMotion
              ? undefined
              : `waveform ${0.9 + (i % 5) * 0.18}s ease-in-out ${i * 0.06}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

export function InterviewPreview() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Ambient glow behind the product */}
      <div
        aria-hidden="true"
        className="absolute -inset-8 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklch,var(--primary)_45%,transparent),transparent_70%)] blur-2xl"
      />

      {/* Main call card */}
      <div className="glass-strong glow-primary relative overflow-hidden rounded-3xl p-5 shadow-2xl">
        {/* header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-heat-200">
              <Mic className="size-4 text-primary-foreground" />
              {!reduceMotion && (
                <span className="animate-pulse-ring absolute inset-0 rounded-full border border-primary" />
              )}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium text-foreground">AI Interviewer</p>
              <p className="text-xs text-muted-foreground">Frontend Developer · Mid-level</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1">
            <span className="size-2 animate-pulse rounded-full bg-destructive" />
            <span className="text-xs font-medium text-destructive">REC 04:12</span>
          </div>
        </div>

        {/* question */}
        <div className="mt-5 rounded-2xl border border-border bg-secondary/40 p-4">
          <p className="text-xs font-medium tracking-wide text-primary-200 uppercase">
            Question 3 of 8
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground text-pretty">
            {'"Can you walk me through how you\u2019d optimise the performance of a large React list?"'}
          </p>
        </div>

        {/* waveform + status */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-background/40 px-4 py-3">
          <Waveform />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-foreground">
            <span className="size-1.5 rounded-full bg-heat-200" />
            Listening
          </span>
        </div>

        {/* transcript */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Live transcript
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="text-foreground">
              {'"I\u2019d start by virtualising the list so only visible rows render, then memoise row components and'}
            </span>{' '}
            <span className="text-muted-foreground/70">stabilise the callbacks to avoid…"</span>
          </p>
        </div>
      </div>

      {/* Floating feedback card */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-8 -left-4 w-60 sm:-left-10"
      >
        <div className="glass-strong animate-float-slow rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary-200" />
              Interview Score
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
              <TrendingUp className="size-3.5" />
              +14
            </span>
          </div>
          <p className="mt-1 font-display text-3xl font-semibold text-foreground">
            82<span className="text-lg text-muted-foreground">/100</span>
          </p>
          <ul className="mt-2 space-y-1.5">
            <li className="flex items-center gap-2 text-xs text-foreground">
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
              Clear, structured answer
            </li>
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <Circle className="size-3.5 shrink-0 text-primary-200" />
              Add measurable impact
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Small floating tag top-right */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="absolute -right-3 top-10 hidden sm:block"
      >
        <div className="glass animate-float-slow rounded-xl px-3 py-2 text-xs font-medium text-foreground shadow-xl [animation-delay:1.5s]">
          <span className="text-heat-200">●</span> Real-time analysis
        </div>
      </motion.div>
    </div>
  )
}
