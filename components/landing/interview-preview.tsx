'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Mic, Sparkles, TrendingUp, CheckCircle2, Circle } from 'lucide-react'
import { HERO_SCENES } from '@/lib/site-data'

const WAVE_BARS = [0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 1, 0.55, 0.75, 0.45, 0.85, 0.65, 0.95, 0.5]
const SCENE_MS = 5200

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

/**
 * The hero's product shot, rotating through several interview scenes.
 *
 * Only the contents animate — the card frame stays put and every changing
 * block reserves a fixed height, so the surrounding layout never shifts as
 * scenes swap. Auto-advance pauses on hover and on keyboard focus, and stops
 * entirely under prefers-reduced-motion, where the carousel becomes a plain
 * set of manually-selectable panels.
 */
export function InterviewPreview() {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const scene = HERO_SCENES[index]

  // Keeps the timer honest when someone clicks a dot mid-cycle.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = useCallback((next: number) => {
    setIndex(((next % HERO_SCENES.length) + HERO_SCENES.length) % HERO_SCENES.length)
  }, [])

  useEffect(() => {
    if (reduceMotion || paused) return

    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SCENES.length)
    }, SCENE_MS)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [reduceMotion, paused, index])

  const fade = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <div
      className="relative mx-auto w-full max-w-md pb-14 sm:pb-16"
      role="region"
      aria-roledescription="carousel"
      aria-label="Interview preview"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Ambient glow behind the product */}
      <div
        aria-hidden="true"
        className="absolute -inset-8 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklch,var(--primary)_45%,transparent),transparent_70%)] blur-2xl"
      />

      {/* Main call card — frame is static, only contents swap */}
      <div className="glass-strong glow-primary relative overflow-hidden rounded-3xl p-5 shadow-2xl">
        {/* header row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-heat-200">
              <Mic className="size-4 text-primary-foreground" />
              {!reduceMotion && (
                <span className="animate-pulse-ring absolute inset-0 rounded-full border border-primary" />
              )}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-medium text-foreground">AI Interviewer</p>
              <div className="h-4 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={scene.role}
                    {...fade}
                    className="truncate text-xs text-muted-foreground"
                  >
                    {scene.role} · {scene.level}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1">
            <span className="size-2 animate-pulse rounded-full bg-destructive" />
            <span className="text-xs font-medium text-destructive tabular-nums">
              REC {scene.timer}
            </span>
          </div>
        </div>

        {/* question — fixed height so the card never resizes */}
        <div className="mt-5 flex min-h-[7.5rem] flex-col rounded-2xl border border-border bg-secondary/40 p-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={scene.questionIndex + scene.role} {...fade}>
              <p className="text-xs font-medium tracking-wide text-primary-200 uppercase">
                {scene.questionIndex}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground text-pretty">
                {scene.question}
              </p>
            </motion.div>
          </AnimatePresence>
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
          <div className="min-h-[3.75rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={scene.answerLead}
                {...fade}
                className="text-sm leading-relaxed text-muted-foreground"
              >
                <span className="text-foreground">{scene.answerLead}</span>{' '}
                <span className="text-muted-foreground/70">{scene.answerTail}</span>
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* progress dots */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {HERO_SCENES.map((s, i) => (
            <button
              key={s.role}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${s.role} interview`}
              aria-current={i === index}
              className={
                i === index
                  ? 'h-1.5 w-7 rounded-full bg-gradient-to-r from-primary to-heat-200 transition-all duration-300'
                  : 'h-1.5 w-1.5 rounded-full bg-muted-foreground/40 transition-all duration-300 hover:bg-muted-foreground'
              }
            />
          ))}
        </div>
      </div>

      {/* Floating feedback card — hidden below sm, where it would cover the transcript */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-2 left-0 hidden w-60 sm:block sm:-bottom-8 sm:-left-10"
      >
        <div className="glass-strong animate-float-slow rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary-200" />
              Interview Score
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={scene.delta}
                {...fade}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400"
              >
                <TrendingUp className="size-3.5" />+{scene.delta}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="mt-1 h-10 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={scene.score}
                {...fade}
                className="font-display text-3xl font-semibold text-foreground tabular-nums"
              >
                {scene.score}
                <span className="text-lg text-muted-foreground">/100</span>
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-2 min-h-[2.75rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul key={scene.hits} {...fade} className="space-y-1.5">
                <li className="flex items-center gap-2 text-xs text-foreground">
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                  {scene.hits}
                </li>
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Circle className="size-3.5 shrink-0 text-primary-200" />
                  {scene.miss}
                </li>
              </motion.ul>
            </AnimatePresence>
          </div>
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
