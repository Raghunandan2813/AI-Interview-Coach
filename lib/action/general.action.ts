"use server";
import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/action/auth.action";
import { getRandomInterviewCover } from "@/lib/utils";
import { groq, createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export async function getInterviewsByUserId(
  userId: string,
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}
export async function getLatestInterviews(
  params: GetLatestInterviewsParams,
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
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
    console.log("Create interview user :", user);
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
  const { interviewId, userId, transcript, feedbackId } = params;
  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`,
      )
      .join("");

    const groqProvider = createGroq({ apiKey: process.env.GROQ_API_KEY! });

    const { text } = await generateText({
      model: groqProvider("llama-3.3-70b-versatile"),
      system: `You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Respond with only valid JSON, no markdown or extra text.`,
      prompt: `Analyze this mock interview transcript and score the candidate. Be thorough and detailed. Don't be lenient; if there are mistakes or areas for improvement, point them out.

Transcript:
${formattedTranscript}

Score the candidate from 0 to 100 in exactly these 5 categories (use these exact names): "Communication Skills", "Technical Knowledge", "Problem Solving", "Cultural Fit", "Confidence and Clarity".

Return a single JSON object with this exact structure (no other fields, no markdown code fence):
{
  "totalScore": <number 0-100>,
  "categoryScores": [
    { "name": "Communication Skills", "score": <number>, "comment": "<string>" },
    { "name": "Technical Knowledge", "score": <number>, "comment": "<string>" },
    { "name": "Problem Solving", "score": <number>, "comment": "<string>" },
    { "name": "Cultural Fit", "score": <number>, "comment": "<string>" },
    { "name": "Confidence and Clarity", "score": <number>, "comment": "<string>" }
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

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScore: object.categoryScores,
      strengths: object.strengths,
      areasForImporvement: object.areasForImprovement,
      finalAssesment: object.finalAssessment,
      createdAt: new Date().toString(),
    };
    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

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
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  const data = feedbackDoc.data() as Record<string, unknown>;
  return {
    id: feedbackDoc.id,
    ...data,
    categoryScores: data.categoryScores ?? data.categoryScore,
    areasForImprovement: data.areasForImprovement ?? data.areasForImporvement,
    finalAssessment: data.finalAssessment ?? data.finalAssesment,
  } as Feedback;
}
