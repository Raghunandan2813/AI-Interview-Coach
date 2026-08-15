"use client";

import React from "react";
import Webcam from "react-webcam";
import { cn } from "@/lib/utils";
import InterviewerOrb, { type OrbState } from "./InterviewerOrb";

type LiveAnswerFeedback = {
  question: string;
  answer: string;
  qualityScore: number;
  fillerCount: number;
  fillerWords: string[];
  suggestion: string;
};

/**
 * The full-screen layout used while an interview is live.
 *
 * Placement is deliberate: the candidate's own face sits left where they can
 * check their framing without it stealing focus, the interviewer sits top
 * right as the thing being spoken to, and coaching occupies the centre where
 * the eye naturally rests between answers.
 */
export default function InterviewStage({
  userName,
  orbState,
  webcamRef,
  cameraOn,
  camError,
  modelsLoaded,
  onCamError,
  latestMessage,
  liveFeedback,
  averageLiveScore,
  trendLabel,
  recentTrendDelta,
  elapsedLabel,
  onDisconnect,
}: {
  userName?: string;
  orbState: OrbState;
  webcamRef: React.RefObject<Webcam | null>;
  cameraOn: boolean;
  camError: boolean;
  modelsLoaded: boolean;
  onCamError: () => void;
  latestMessage?: string;
  liveFeedback: LiveAnswerFeedback[];
  averageLiveScore: number | null;
  trendLabel: string;
  recentTrendDelta: number;
  elapsedLabel: string;
  onDisconnect: () => void;
}) {
  const scoreTone =
    averageLiveScore === null
      ? "text-light-600"
      : averageLiveScore >= 75
        ? "text-tier-strong"
        : averageLiveScore >= 55
          ? "text-tier-mid"
          : "text-tier-weak";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-dark-100 text-light-100">
      {/* top bar */}
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-heat-200 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-heat-200" />
          </span>
          <span className="eyebrow !text-heat-100">Recording</span>
        </div>
        <span className="stat-num text-lg text-light-100">{elapsedLabel}</span>
      </header>

      <div className="grid flex-1 min-h-0 gap-4 p-4 lg:grid-cols-[minmax(240px,320px)_1fr] lg:grid-rows-[auto_1fr]">

        {/* LEFT — the candidate */}
        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-dark-200 p-4 lg:row-span-2 min-h-0">
          <p className="eyebrow">You</p>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-dark-300 ring-1 ring-white/10">
            {!cameraOn ? (
              <div className="flex size-full flex-col items-center justify-center gap-1 text-center px-3">
                <span className="text-xs font-bold uppercase tracking-wider text-light-400">
                  Camera off
                </span>
                <span className="text-[11px] text-light-600">Audio-only mode</span>
              </div>
            ) : camError ? (
              <div className="flex size-full flex-col items-center justify-center gap-1 bg-destructive-100/10 text-center px-3">
                <span className="text-xs font-bold uppercase tracking-wider text-destructive-100">
                  Camera blocked
                </span>
                <span className="text-[11px] text-destructive-100/70">Audio-only mode</span>
              </div>
            ) : modelsLoaded ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                mirrored
                videoConstraints={{ facingMode: "user" }}
                onUserMediaError={onCamError}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full animate-pulse items-center justify-center">
                <span className="text-[11px] text-light-600">Starting camera…</span>
              </div>
            )}
          </div>

          <p className="text-sm font-extrabold uppercase tracking-wide text-light-100 truncate">
            {userName || "Candidate"}
          </p>

          {/* running score, kept beside the candidate rather than in the centre */}
          <div className="mt-auto flex flex-col gap-3 pt-3 border-t border-white/10">
            <div className="flex items-baseline justify-between gap-2">
              <span className="eyebrow">Running score</span>
              <span className={cn("stat-num text-2xl", scoreTone)}>
                {averageLiveScore ?? "—"}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="eyebrow">Trend</span>
              <span
                className={cn(
                  "text-xs font-extrabold uppercase tracking-wider",
                  trendLabel === "Improving"
                    ? "text-tier-strong"
                    : trendLabel === "Dropping"
                      ? "text-tier-weak"
                      : "text-light-400",
                )}
              >
                {trendLabel}
                {recentTrendDelta !== 0 && (
                  <span className="stat-num ml-1.5 text-light-500">
                    {recentTrendDelta > 0 ? "+" : ""}
                    {recentTrendDelta}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="eyebrow">Answers</span>
              <span className="stat-num text-sm text-light-300">{liveFeedback.length}</span>
            </div>
          </div>
        </section>

        {/* TOP RIGHT — the interviewer */}
        <section className="flex items-center justify-center gap-6 rounded-2xl border border-primary-200/25 bg-dark-200 p-4 min-h-0 lg:justify-end lg:px-8">
          <div className="hidden flex-col items-end text-right sm:flex">
            <p className="eyebrow">Interviewer</p>
            <p
              className={cn(
                "text-lg font-extrabold uppercase tracking-tight transition-colors",
                orbState === "speaking"
                  ? "text-heat-100"
                  : orbState === "listening"
                    ? "text-primary-200"
                    : "text-light-400",
              )}
            >
              {orbState === "speaking"
                ? "Speaking"
                : orbState === "listening"
                  ? "Listening"
                  : "Connecting"}
            </p>
          </div>
          <InterviewerOrb state={orbState} size={150} />
        </section>

        {/* CENTRE — live coaching */}
        <section className="flex min-h-0 flex-col gap-3 rounded-2xl border border-white/10 bg-dark-200 p-4 md:p-5">
          {latestMessage && (
            <div className="rounded-xl border border-white/10 bg-dark-300/60 px-4 py-3 shrink-0">
              <p className="text-sm md:text-base leading-relaxed text-light-100 line-clamp-3">
                {latestMessage}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 shrink-0">
            <p className="eyebrow">Live feedback</p>
            {liveFeedback.length > 0 && (
              <span className="text-[11px] text-light-600">
                {liveFeedback.length} answer{liveFeedback.length > 1 ? "s" : ""} analysed
              </span>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto no-scrollbar pr-1">
            {liveFeedback.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-center px-6">
                <p className="text-sm text-light-600 max-w-sm leading-relaxed">
                  Answer a question and your score, filler-word count and a sharper
                  way to phrase it will appear here.
                </p>
              </div>
            ) : (
              [...liveFeedback].reverse().map((item, index) => {
                const number = liveFeedback.length - index;
                const tone =
                  item.qualityScore >= 75
                    ? "text-tier-strong"
                    : item.qualityScore >= 55
                      ? "text-tier-mid"
                      : "text-tier-weak";
                return (
                  <div
                    key={`${number}-${item.qualityScore}`}
                    className="rounded-xl border border-white/10 bg-dark-300/50 p-3 shrink-0"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="eyebrow">Answer {number}</span>
                      <span className={cn("stat-num text-sm", tone)}>
                        {item.qualityScore}
                      </span>
                    </div>
                    <p className="mb-1 line-clamp-1 text-xs text-light-500">{item.question}</p>
                    <p className="text-[11px] text-light-600">
                      Fillers:{" "}
                      <span className="text-light-300 font-medium">{item.fillerCount}</span>
                      {item.fillerWords.length > 0 && ` (${item.fillerWords.join(", ")})`}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-primary-100">
                      {item.suggestion}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <footer className="flex items-center justify-center border-t border-white/10 px-5 py-3 shrink-0">
        <button className="btn-disconnect" onClick={onDisconnect}>
          End interview
        </button>
      </footer>
    </div>
  );
}
