"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/action/auth.action";
// A voice call bills across Vapi, Deepgram, ElevenLabs and OpenAI at once, so
// usage is metered in minutes rather than sessions — minutes are what we pay
// for. Both limits live in @/constants: everything exported from a "use server"
// module has to be an async function, so a plain number can't sit here.
import { MAX_INTERVIEW_SECONDS, MONTHLY_FREE_SECONDS } from "@/constants";

export type BudgetCheck = {
  allowed: boolean;
  remainingSeconds: number;
  usedSeconds: number;
  limitSeconds: number;
  reason?: string;
};

// Usage is bucketed per calendar month so the allowance resets without a cron.
const periodKey = () => new Date().toISOString().slice(0, 7); // "2026-08"

const usageDocId = (userId: string) => `${userId}_${periodKey()}`;

async function readUsageSeconds(userId: string): Promise<number> {
  const doc = await db.collection("usage").doc(usageDocId(userId)).get();
  if (!doc.exists) return 0;
  return (doc.data()?.secondsUsed as number) ?? 0;
}

/**
 * Called before a call starts. This gates the UI — it cannot be the only
 * defence, because vapi.start() runs in the browser with a public token and
 * anyone with devtools can call it directly. The hard ceiling is
 * MAX_INTERVIEW_SECONDS on the assistant, which Vapi enforces server-side.
 */
export async function checkInterviewBudget(): Promise<BudgetCheck> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      allowed: false,
      remainingSeconds: 0,
      usedSeconds: 0,
      limitSeconds: MONTHLY_FREE_SECONDS,
      reason: "You must be signed in to start an interview.",
    };
  }

  const usedSeconds = await readUsageSeconds(user.id);
  const remainingSeconds = Math.max(0, MONTHLY_FREE_SECONDS - usedSeconds);

  // Require room for a full call rather than letting someone start one they
  // cannot finish.
  if (remainingSeconds < MAX_INTERVIEW_SECONDS) {
    const remainingMinutes = Math.floor(remainingSeconds / 60);
    return {
      allowed: false,
      remainingSeconds,
      usedSeconds,
      limitSeconds: MONTHLY_FREE_SECONDS,
      reason:
        remainingMinutes > 0
          ? `Only ${remainingMinutes} min left this month — an interview needs ${MAX_INTERVIEW_SECONDS / 60} min. Your allowance resets next month.`
          : "You've used your practice minutes for this month. Your allowance resets next month.",
    };
  }

  return {
    allowed: true,
    remainingSeconds,
    usedSeconds,
    limitSeconds: MONTHLY_FREE_SECONDS,
  };
}

/**
 * Records what a call actually consumed. The duration is reported by the
 * browser and is therefore forgeable — it is clamped to the assistant's hard
 * ceiling so a bad value cannot corrupt the running total. Replace this with
 * Vapi's `end-of-call-report` webhook when accurate billing matters.
 */
export async function recordInterviewUsage(seconds: number) {
  const user = await getCurrentUser();
  if (!user) return { success: false };

  if (!Number.isFinite(seconds) || seconds <= 0) return { success: false };
  const clamped = Math.min(Math.round(seconds), MAX_INTERVIEW_SECONDS);

  const ref = db.collection("usage").doc(usageDocId(user.id));

  // A transaction keeps two calls ending at once from clobbering the counter.
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const current = doc.exists ? ((doc.data()?.secondsUsed as number) ?? 0) : 0;
    tx.set(
      ref,
      {
        userId: user.id,
        period: periodKey(),
        secondsUsed: current + clamped,
        calls: (doc.exists ? ((doc.data()?.calls as number) ?? 0) : 0) + 1,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  });

  return { success: true };
}

/** Powers the "X minutes left" readout on the dashboard. */
export async function getUsageSummary(): Promise<BudgetCheck | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const usedSeconds = await readUsageSeconds(user.id);
  const remainingSeconds = Math.max(0, MONTHLY_FREE_SECONDS - usedSeconds);

  return {
    allowed: remainingSeconds >= MAX_INTERVIEW_SECONDS,
    remainingSeconds,
    usedSeconds,
    limitSeconds: MONTHLY_FREE_SECONDS,
  };
}
