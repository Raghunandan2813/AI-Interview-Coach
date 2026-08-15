"use server";

import { groq, createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/action/auth.action";

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

export type QuizResult = {
  id: string;
  topic: string;
  score: number;
  total: number;
  createdAt: string;
};

export async function generateQuizQuestions(
  topic?: string
): Promise<{ success: true; questions: QuizQuestion[] } | { success: false; error: string }> {
  try {
    // This action bills Groq on every call, so it needs a session — an exported
    // server action is a public HTTP endpoint.
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "You must be signed in to generate a quiz." };
    }

    // The topic lands in a prompt, so keep it to something topic-shaped.
    if (topic && topic.length > 100) {
      return { success: false, error: "That topic is too long. Keep it under 100 characters." };
    }

    const defaultTopics = [
      "JavaScript Event Loop", "React Hooks", "System Design patterns", "Object Oriented Programming", 
      "Database High Availability", "REST API architecture", "TCP/IP vs UDP", "Git workflows"
    ];
    const finalTopic = topic && topic.trim() !== "" ? topic : defaultTopics[Math.floor(Math.random() * defaultTopics.length)];

    const groqProvider = createGroq({ apiKey: process.env.GROQ_API_KEY! });
    
    // Using llama-3.3-70b-versatile for fast reasoning
    const { text } = await generateText({
      model: groqProvider("llama-3.3-70b-versatile"),
      system: `You are an expert technical interviewer designing a fun multiple-choice quiz. Return ONLY valid JSON, adhering exactly to the structure requested, with absolutely no markdown wrapping, no markdown \`\`\`json\`\`\` fences, and no conversational text.`,
      prompt: `Generate 5 multiple-choice questions on the topic: "${finalTopic}".
      
      ESCALATING DIFFICULTY REQUIREMENT:
      Question 1: Very Easy
      Question 2: Easy
      Question 3: Medium
      Question 4: Hard
      Question 5: Extremely Difficult/Niche
      
      Return a JSON array of precisely this structure:
      [
        {
          "question": "<string>",
          "options": ["<string>", "<string>", "<string>", "<string>"],
          "correctAnswerIndex": <index from 0 to 3>,
          "explanation": "<short string explaining why>"
        }
      ]`,
    });

    // Clean any accidental markdown blocks returned by the model
    const rawJson = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    
    const parsedQuestions = JSON.parse(rawJson);
    
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length !== 5) {
      throw new Error("Invalid output structure");
    }

    return { success: true, questions: parsedQuestions };
  } catch (error) {
    console.error("Error generating quiz", error);
    return { success: false, error: "Failed to generate questions. Please try again." };
  }
}

/**
 * Persists a finished quiz. The score is reported by the browser and is not
 * verifiable, so quiz results are deliberately kept out of the leaderboard —
 * they're a personal practice log, not a ranking input.
 */
export async function saveQuizResult(params: { topic: string; score: number; total: number }) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    const { topic, score, total } = params;
    if (!Number.isInteger(score) || !Number.isInteger(total) || total <= 0) {
      return { success: false };
    }
    if (score < 0 || score > total) return { success: false };

    await db.collection("quizResults").add({
      userId: user.id,
      topic: (topic || "Surprise").slice(0, 100),
      score,
      total,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving quiz result", error);
    return { success: false };
  }
}

export async function getQuizHistory(): Promise<QuizResult[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const snapshot = await db
    .collection("quizResults")
    .where("userId", "==", user.id)
    .get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as QuizResult)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 20);
}
