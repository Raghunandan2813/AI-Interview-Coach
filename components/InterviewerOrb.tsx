"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type OrbState = "idle" | "connecting" | "listening" | "speaking";

/**
 * The interviewer's face for the voice agent — a techy halo built from stacked
 * SVG rings rather than a static avatar, so the call has something that reacts.
 *
 * Each state reads differently at a glance without needing a caption:
 *   idle       dim, slow breathing
 *   connecting rings spin up, no colour commitment yet
 *   listening  steady cyan — your turn
 *   speaking   pink energy pushing outward from the core
 *
 * Everything is CSS and inline SVG. prefers-reduced-motion is honoured
 * globally in globals.css, which freezes all of this to a static composition.
 */
export default function InterviewerOrb({
  state = "idle",
  src = "/roboo.png",
  size = 220,
  className,
}: {
  state?: OrbState;
  src?: string;
  size?: number;
  className?: string;
}) {
  const isSpeaking = state === "speaking";
  const isConnecting = state === "connecting";
  const isLive = state === "listening" || isSpeaking;

  // Speaking runs hot (pink), listening runs cool (cyan), idle stays muted.
  const accent = isSpeaking ? "#FF2D78" : isLive ? "#00E1F0" : "#6E6676";

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        isSpeaking
          ? "Interviewer is speaking"
          : state === "listening"
            ? "Interviewer is listening"
            : isConnecting
              ? "Connecting to interviewer"
              : "Interviewer ready"
      }
    >
      {/* expanding halo rings — only while actually speaking */}
      {isSpeaking && (
        <>
          <span
            className="absolute inset-0 rounded-full border-2 animate-halo-out"
            style={{ borderColor: accent }}
          />
          <span
            className="absolute inset-0 rounded-full border animate-halo-out"
            style={{ borderColor: accent, animationDelay: "0.65s" }}
          />
          <span
            className="absolute inset-0 rounded-full border animate-halo-out"
            style={{ borderColor: accent, animationDelay: "1.3s" }}
          />
        </>
      )}

      {/* ambient bloom behind everything */}
      <span
        className={cn(
          "absolute inset-8 rounded-full blur-2xl transition-opacity duration-500",
          isLive ? "opacity-60" : "opacity-25",
          !isLive && "animate-breathe",
        )}
        style={{ backgroundColor: accent }}
      />

      {/* outer scanning ring */}
      <svg
        viewBox="0 0 200 200"
        className={cn(
          "absolute inset-0 size-full",
          isConnecting ? "animate-spin-rev" : "animate-spin-slow",
        )}
      >
        <circle
          cx="100"
          cy="100"
          r="97"
          fill="none"
          stroke={accent}
          strokeWidth="1"
          strokeDasharray="3 9"
          opacity={isLive ? 0.75 : 0.35}
        />
      </svg>

      {/* counter-rotating arc pair — the "tracking" read */}
      <svg
        viewBox="0 0 200 200"
        className={cn(
          "absolute inset-0 size-full",
          isConnecting ? "animate-spin-slow" : "animate-spin-rev",
        )}
      >
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="52 218"
          opacity={isLive ? 0.9 : 0.4}
        />
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="26 244"
          strokeDashoffset="-135"
          opacity={isLive ? 0.6 : 0.25}
        />
      </svg>

      {/* inner hairline */}
      <span
        className="absolute rounded-full border transition-colors duration-500"
        style={{
          inset: size * 0.16,
          borderColor: accent,
          opacity: isLive ? 0.45 : 0.2,
        }}
      />

      {/* the face */}
      <div
        className="absolute rounded-full overflow-hidden bg-dark-100 ring-1 ring-white/10 flex items-center justify-center transition-transform duration-300"
        style={{
          inset: size * 0.24,
          transform: isSpeaking ? "scale(1.04)" : "scale(1)",
          boxShadow: isLive ? `0 0 36px -8px ${accent}` : "none",
        }}
      >
        <Image
          src={src}
          alt=""
          width={Math.round(size * 0.52)}
          height={Math.round(size * 0.52)}
          className="object-contain"
          priority
        />
      </div>

      {/* three-dot equaliser pinned to the base while speaking */}
      {isSpeaking && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 flex items-end gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1 rounded-full animate-bounce"
              style={{
                backgroundColor: accent,
                height: i === 1 ? 14 : 9,
                animationDelay: `${i * 0.12}s`,
                animationDuration: "0.7s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
