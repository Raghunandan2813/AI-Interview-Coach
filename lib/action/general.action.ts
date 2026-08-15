"use server";
import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/action/auth.action";
import { getRandomInterviewCover } from "@/lib/utils";
import { groq, createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import {
  analyseTranscript,
  evidenceCeiling,
  weightedTotal,
  RUBRIC,
} from "@/lib/scoring";

export async function getInterviewsByUserId(): Promise<Interview[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", user.id)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams = {},
): Promise<Interview[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { limit = 20 } = params;
  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", user.id)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  // Interviews are shared — any signed-in user can take one — but anonymous
  // callers must not be able to enumerate them.
  const user = await getCurrentUser();
  if (!user) return null;

  const doc = await db.collection("interviews").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Interview;
}

export type CreateInterviewParams = {
  role: string;
  type: string;
  level: string;
  techstack: string;
  amount: number;
};

export async function createInterview(
  params: CreateInterviewParams,
): Promise<
  { success: true; interviewId: string } | { success: false; error: string }
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be signed in to create an interview.",
      };
    }

    const { role, type, level, techstack, amount } = params;
    if (!role?.trim() || !level?.trim() || !amount || amount < 1) {
      return { success: false, error: "Role, level, and amount are required." };
    }

    const groqProvider = createGroq({ apiKey: process.env.GROQ_API_KEY! });
    const { text } = await generateText({
      model: groqProvider("llama-3.3-70b-versatile"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack || "general"}.
        The focus between behavioural and technical questions should lean towards: ${type || "mix"}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]

        Thank you!`,
    });

    let parsedQuestions: string[] = [];
    try {
      parsedQuestions = JSON.parse(text);
      if (!Array.isArray(parsedQuestions)) parsedQuestions = [];
    } catch {
      return {
        success: false,
        error: "Failed to generate valid questions. Please try again.",
      };
    }

    const interview = {
      role: role.trim(),
      type: (type || "mix").trim(),
      level: level.trim(),
      techstack: techstack
        ? techstack
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      questions: parsedQuestions,
      userId: user.id,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);
    return { success: true, interviewId: docRef.id };
  } catch (e) {
    console.error("Error creating interview", e);
    return {
      success: false,
      error: "Failed to create interview. Please try again.",
    };
  }
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, transcript, behaviorAnalysis } = params;
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    if (!interviewId || !Array.isArray(transcript) || transcript.length === 0) {
      return { success: false };
    }

    // The interview must exist before we score it.
    const interviewDoc = await db
      .collection("interviews")
      .doc(interviewId)
      .get();
    if (!interviewDoc.exists) return { success: false };

    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`,
      )
      .join("");
      
    const behaviorContext = behaviorAnalysis 
      ? `\nDelivery signals estimated from the candidate's camera (noisy — treat as weak evidence, never as proof of misconduct):
- Appeared composed in ${behaviorAnalysis.confidentScore}% of samples
- Appeared tense in ${behaviorAnalysis.nervousScore}% of samples
- Face not detected in ${behaviorAnalysis.cheatingFlags} samples (commonly caused by lighting or camera angle, not by cheating)
Use these only to add gentle, practical delivery coaching to your feedback. Do NOT accuse the candidate of cheating or dishonesty under any circumstances, and do not let these numbers change the technical scoring.`
      : "";

    // Facts measured from the transcript, not guessed by the model. Handing
    // these over stops it inventing its own impression of how much was said.
    const stats = analyseTranscript(transcript);
    const { ceiling, reason: ceilingReason } = evidenceCeiling(stats);

    const groqProvider = createGroq({ apiKey: process.env.GROQ_API_KEY! });

    const { text } = await generateText({
      model: groqProvider("llama-3.3-70b-versatile"),
      // Deterministic. The same transcript must produce the same grade, or the
      // progress chart is measuring noise instead of improvement.
      temperature: 0,
      system: `You are a strict, consistent interview grader. You judge only what is present in the transcript and you cite evidence for every score.
You never invent detail the candidate did not say. You never soften a score to be encouraging — the coaching goes in the written feedback, not in the number.
Respond with valid JSON only. No markdown, no code fence, no commentary.`,
      prompt: `Grade this mock interview transcript.

${RUBRIC}

Measured facts about this transcript (already computed — treat as ground truth):
- Candidate answers given: ${stats.answerCount}
- Answers substantial enough to assess (8+ words): ${stats.substantiveAnswers}
- Total words spoken by candidate: ${stats.totalWords}
- Average words per answer: ${stats.avgWordsPerAnswer}
- Filler words used: ${stats.fillerCount} (${stats.fillerPer100Words} per 100 words)
${behaviorContext}

Transcript:
${formattedTranscript}

Score these exact five categories: "Communication Skills", "Technical Knowledge", "Problem Solving", "Cultural Fit", "Confidence and Clarity".

Write "strengths" and "areasForImprovement" as specific, actionable items that reference what the candidate actually said. Avoid generic advice that would fit any candidate.
"finalAssessment" should be 2-4 sentences addressed to the candidate directly.

Return exactly this JSON shape:
{
  "categoryScores": [
    { "name": "Communication Skills", "score": <0-100>, "comment": "<evidence-backed, 1-2 sentences>" },
    { "name": "Technical Knowledge", "score": <0-100>, "comment": "<evidence-backed, 1-2 sentences>" },
    { "name": "Problem Solving", "score": <0-100>, "comment": "<evidence-backed, 1-2 sentences>" },
    { "name": "Cultural Fit", "score": <0-100>, "comment": "<evidence-backed, 1-2 sentences>" },
    { "name": "Confidence and Clarity", "score": <0-100>, "comment": "<evidence-backed, 1-2 sentences>" }
  ],
  "strengths": ["<string>", ...],
  "areasForImprovement": ["<string>", ...],
  "finalAssessment": "<string>"
}`,
    });

    const rawJson = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(rawJson);
    const result = feedbackSchema.safeParse(parsed);
    if (!result.success) {
      console.error(
        "Feedback schema validation failed",
        result.error.flatten(),
      );
      return { success: false };
    }
    const object = result.data;

    // The model grades the categories; the total is arithmetic. That way the
    // headline number can never contradict the breakdown underneath it.
    const rawTotal = weightedTotal(object.categoryScores);
    const totalScore = Math.min(rawTotal, ceiling);

    const areasForImprovement = [...object.areasForImprovement];
    if (ceilingReason && rawTotal > ceiling) {
      // Be explicit when the cap bit, rather than leaving a confusing number.
      areasForImprovement.unshift(ceilingReason);
    }

    const feedback = {
      interviewId,
      userId: user.id,
      totalScore,
      categoryScore: object.categoryScores,
      strengths: object.strengths,
      areasForImporvement: areasForImprovement,
      finalAssesment: object.finalAssessment,
      behaviorAnalysis: behaviorAnalysis || null,
      // Kept so a score can be explained — and re-derived if the rubric changes.
      scoring: {
        rawTotal,
        ceiling,
        stats,
        rubricVersion: 2,
      },
      createdAt: new Date().toISOString(),
    };

    // Reuse this user's existing feedback for the interview if there is one.
    // The document id is never taken from the caller, so one user can never
    // overwrite another user's report.
    const existing = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", user.id)
      .limit(1)
      .get();

    const feedbackRef = existing.empty
      ? db.collection("feedback").doc()
      : existing.docs[0].ref;

    await feedbackRef.set(feedback);
    return {
      success: true,
      feedbackId: feedbackRef.id,
    };
  } catch (e) {
    console.log("Error saving feedback", e);
    return { success: false };
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams,
): Promise<Feedback | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { interviewId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", user.id)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  const data = feedbackDoc.data() as Record<string, unknown>;
  return {
    id: feedbackDoc.id,
    ...data,
    behaviorAnalysis: data.behaviorAnalysis || null,
    categoryScores: data.categoryScores ?? data.categoryScore,
    areasForImprovement: data.areasForImprovement ?? data.areasForImporvement,
    finalAssessment: data.finalAssessment ?? data.finalAssesment,
  } as Feedback;
}

export async function getFeedbacksByUserId(): Promise<Feedback[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const querySnapshot = await db
    .collection("feedback")
    .where("userId", "==", user.id)
    .get();

  if (querySnapshot.empty) return null;

  const feedbacks = querySnapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    return {
      id: doc.id,
      ...data,
      behaviorAnalysis: data.behaviorAnalysis || null,
      categoryScores: data.categoryScores ?? data.categoryScore,
      areasForImprovement: data.areasForImprovement ?? data.areasForImporvement,
      finalAssessment: data.finalAssessment ?? data.finalAssesment,
    };
  }) as Feedback[];

  return feedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
