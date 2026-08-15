import { cn } from "@/lib/utils";

/**
 * The one place score colour is decided. Tier colours are deliberately outside
 * the brand palette — cyan and pink mean "brand", these mean "how did I do",
 * and conflating the two would make the number unreadable at a glance.
 */
export type ScoreTier = "weak" | "mid" | "strong";

export function tierOf(score: number): ScoreTier {
  if (score >= 75) return "strong";
  if (score >= 55) return "mid";
  return "weak";
}

const TIER: Record<
  ScoreTier,
  { text: string; bar: string; ring: string; label: string }
> = {
  strong: {
    text: "text-tier-strong",
    bar: "bg-tier-strong",
    ring: "ring-tier-strong/40",
    label: "Strong",
  },
  mid: {
    text: "text-tier-mid",
    bar: "bg-tier-mid",
    ring: "ring-tier-mid/40",
    label: "Improving",
  },
  weak: {
    text: "text-tier-weak",
    bar: "bg-tier-weak",
    ring: "ring-tier-weak/40",
    label: "Needs work",
  },
};

export function ScoreMeter({
  score,
  label,
  showTier = false,
  className,
}: {
  score: number;
  label?: string;
  showTier?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const tier = TIER[tierOf(clamped)];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {(label || showTier) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && <span className="eyebrow">{label}</span>}
          <span className={cn("stat-num text-sm", tier.text)}>
            {clamped}
            <span className="text-light-600">/100</span>
          </span>
        </div>
      )}
      <div className="meter-track">
        <div
          className={cn("meter-fill", tier.bar)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showTier && (
        <span className={cn("text-[11px] font-bold uppercase tracking-wider", tier.text)}>
          {tier.label}
        </span>
      )}
    </div>
  );
}

/** Big hero readout for the feedback report and result cards. */
export function ScoreDial({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const tier = TIER[tierOf(clamped)];

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "flex flex-col items-center justify-center size-40 rounded-full ring-4 bg-dark-200",
          tier.ring,
        )}
      >
        <span className={cn("stat-num text-6xl leading-none", tier.text)}>
          {clamped}
        </span>
        <span className="eyebrow mt-1">out of 100</span>
      </div>
      <span className={cn("text-sm font-extrabold uppercase tracking-[0.15em]", tier.text)}>
        {tier.label}
      </span>
    </div>
  );
}
