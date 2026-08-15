/**
 * Scoring rules for interview feedback.
 *
 * The old version asked the model for a holistic 0-100 and trusted it. Two runs
 * over the same transcript could differ by 20 points, and `totalScore` was
 * picked independently of the category scores, so they routinely disagreed.
 *
 * Three changes make the number mean something:
 *   1. Anchored bands — each score range is described by observable behaviour
 *      the grader can check against the transcript, not adjectives.
 *   2. The total is computed here, in code, as a weighted average of the
 *      categories. The model never picks it, so it can't contradict them.
 *   3. A ceiling derived from the transcript itself. A candidate who barely
 *      spoke cannot be awarded 70 no matter how generous the model feels.
 */

export type TranscriptLine = { role: string; content: string };

export type TranscriptStats = {
  answerCount: number;
  substantiveAnswers: number;
  totalWords: number;
  avgWordsPerAnswer: number;
  fillerCount: number;
  fillerPer100Words: number;
  questionsAsked: number;
};

// Technical depth and problem solving carry the most weight; culture fit is the
// hardest to read from a short mock interview, so it carries the least.
export const CATEGORY_WEIGHTS: Record<string, number> = {
  "Communication Skills": 0.2,
  "Technical Knowledge": 0.3,
  "Problem Solving": 0.25,
  "Cultural Fit": 0.1,
  "Confidence and Clarity": 0.15,
};

const FILLER_REGEX =
  /\b(um+|uh+|erm|ah+|like|you know|actually|basically|literally)\b/gi;

const countWords = (text: string) => (text.match(/\b[\w'-]+\b/g) || []).length;

/** An answer under 8 words isn't an answer — it's an acknowledgement. */
const SUBSTANTIVE_WORD_FLOOR = 8;

export function analyseTranscript(transcript: TranscriptLine[]): TranscriptStats {
  const answers = transcript.filter(
    (line) => line.role === "users" || line.role === "user",
  );
  const questions = transcript.filter(
    (line) => line.role === "assistance" || line.role === "assistant",
  );

  const wordCounts = answers.map((a) => countWords(a.content));
  const totalWords = wordCounts.reduce((sum, n) => sum + n, 0);
  const substantive = wordCounts.filter((n) => n >= SUBSTANTIVE_WORD_FLOOR).length;
  const fillerCount = answers.reduce(
    (sum, a) => sum + (a.content.match(FILLER_REGEX) || []).length,
    0,
  );

  return {
    answerCount: answers.length,
    substantiveAnswers: substantive,
    totalWords,
    avgWordsPerAnswer: answers.length ? Math.round(totalWords / answers.length) : 0,
    fillerCount,
    fillerPer100Words: totalWords
      ? Math.round((fillerCount / totalWords) * 1000) / 10
      : 0,
    questionsAsked: questions.length,
  };
}

/**
 * The most a transcript can be worth given how much the candidate actually
 * said. This is the guard against the model rewarding an empty interview.
 */
export function evidenceCeiling(stats: TranscriptStats): {
  ceiling: number;
  reason: string | null;
} {
  if (stats.substantiveAnswers === 0) {
    return {
      ceiling: 10,
      reason:
        "There were no answers long enough to assess. Run the interview again and speak your answers in full.",
    };
  }
  if (stats.substantiveAnswers === 1) {
    return {
      ceiling: 35,
      reason:
        "Only one answer was long enough to assess, so this score reflects a very small sample.",
    };
  }
  if (stats.substantiveAnswers === 2) {
    return {
      ceiling: 50,
      reason:
        "Only two answers were long enough to assess. Complete more of the interview for a fuller picture.",
    };
  }
  if (stats.totalWords < 120) {
    return {
      ceiling: 55,
      reason:
        "The interview was very short overall, which caps how high it can score.",
    };
  }
  if (stats.avgWordsPerAnswer < 15) {
    return {
      ceiling: 65,
      reason:
        "Answers were consistently brief. Aim for 40-90 words: claim, reasoning, then a concrete example.",
    };
  }
  return { ceiling: 100, reason: null };
}

/** Weighted average of category scores, computed here so it can never drift. */
export function weightedTotal(
  categoryScores: { name: string; score: number }[],
): number {
  let weighted = 0;
  let weightUsed = 0;

  for (const category of categoryScores) {
    const weight = CATEGORY_WEIGHTS[category.name];
    if (weight === undefined) continue;
    const clamped = Math.max(0, Math.min(100, category.score));
    weighted += clamped * weight;
    weightUsed += weight;
  }

  if (weightUsed === 0) return 0;
  return Math.round(weighted / weightUsed);
}

/**
 * Band descriptors written as things a grader can verify in the transcript.
 * "Vague" is an opinion; "gave no concrete example" is checkable, and checkable
 * criteria are what make two runs agree.
 */
export const RUBRIC = `Score each category 0-100 using these anchors. Choose the highest band whose description is fully true of the transcript.

0-19  — Did not engage. No relevant content, or declined to answer.
20-39 — Attempted, but mostly incorrect, off-topic, or a single sentence with no reasoning.
40-54 — Names the right idea but cannot explain why. No example. Reasoning stops at one step.
55-69 — Correct and explained, but generic. Would apply to any candidate. No specific project, number, or trade-off named.
70-84 — Correct, explained, AND grounded in at least one concrete specific: a named tool, a real situation, a measurable outcome, or an explicit trade-off.
85-94 — All of the above, plus anticipates edge cases or alternatives unprompted, and structures the answer so the conclusion arrives early.
95-100 — Exceptional and rare. Reserve for answers a senior engineer would repeat to a colleague verbatim.

Category definitions:
- "Communication Skills": structure and economy. Did the answer lead with the point? Was it followable on first hearing?
- "Technical Knowledge": factual correctness and depth of the domain content.
- "Problem Solving": how the candidate reasons toward an answer — decomposition, trade-offs, handling ambiguity.
- "Cultural Fit": collaboration, ownership, and how they describe working with others. If the transcript contains no evidence either way, score 55 and say so.
- "Confidence and Clarity": steadiness and decisiveness of delivery, judged from wording and hedging in the transcript.

Hard rules:
- Every category comment MUST quote or closely paraphrase something the candidate actually said. If you cannot point to evidence, the score belongs below 55.
- Do not award 70 or above to any category with no concrete specific anywhere in the transcript.
- Judge only what is in the transcript. Never assume skill that was not demonstrated.`;
