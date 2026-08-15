import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

// firebase-admin needs the Node runtime.
export const runtime = "nodejs";

/**
 * Called by Vapi server-to-server when the voice assistant finishes collecting
 * the interview brief. A browser session cookie can never reach here, so the
 * request is authenticated with a shared secret that Vapi sends as a header.
 *
 * Configure it on the assistant's tool in the Vapi dashboard:
 *   Server URL: https://<your-domain>/api/vapi/generate
 *   Headers:    { "x-vapi-secret": "<value of VAPI_SERVER_SECRET>" }
 *
 * The secret must live in the dashboard, never in an assistant defined in
 * client code — anything in the browser bundle is public.
 */

type GenerateArgs = {
  role?: string;
  level?: string;
  techstack?: string | string[];
  type?: string;
  amount?: number | string;
  userid?: string;
};

function isAuthorized(request: Request): boolean {
  const expected = process.env.VAPI_SERVER_SECRET;
  // Fail closed: with no secret configured, nothing is authorised.
  if (!expected) {
    console.error("VAPI_SERVER_SECRET is not set — rejecting request.");
    return false;
  }

  const provided = request.headers.get("x-vapi-secret") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Vapi has used a few request shapes over time, and a tool can also be pointed
 * here with a plain custom body. Accept whichever arrives.
 */
function extractCall(body: any): {
  toolCallId: string | null;
  name: string;
  args: GenerateArgs;
} {
  const message = body?.message;

  const toolCalls = message?.toolCallList ?? message?.toolCalls;
  const first = Array.isArray(toolCalls) ? toolCalls[0] : null;

  if (first) {
    let args = first.function?.arguments;
    if (typeof args === "string") {
      try {
        args = JSON.parse(args);
      } catch {
        args = {};
      }
    }
    return {
      toolCallId: first.id ?? null,
      name: first.function?.name ?? "generateInterview",
      args: (args ?? {}) as GenerateArgs,
    };
  }

  // Older "function-call" shape.
  const fn = message?.functionCall;
  if (fn) {
    let params = fn.parameters;
    if (typeof params === "string") {
      try {
        params = JSON.parse(params);
      } catch {
        params = {};
      }
    }
    return {
      toolCallId: null,
      name: fn.name ?? "generateInterview",
      args: (params ?? {}) as GenerateArgs,
    };
  }

  // Flat custom body.
  return {
    toolCallId: null,
    name: "generateInterview",
    args: (body ?? {}) as GenerateArgs,
  };
}

function toolResponse(
  toolCallId: string | null,
  name: string,
  result: string,
  httpStatus = 200,
) {
  if (toolCallId) {
    return NextResponse.json(
      { results: [{ name, toolCallId, result }] },
      { status: httpStatus },
    );
  }
  return NextResponse.json({ result }, { status: httpStatus });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { toolCallId, name, args } = extractCall(body);

  try {
    const role = String(args.role ?? "").trim();
    const level = String(args.level ?? "").trim();
    const type = String(args.type ?? "mix").trim();
    const userid = String(args.userid ?? "").trim();

    const techstack = Array.isArray(args.techstack)
      ? args.techstack.map((t) => String(t).trim()).filter(Boolean)
      : String(args.techstack ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

    // Clamp rather than trust — this drives a paid model call.
    const parsedAmount = Number(args.amount);
    const amount = Number.isFinite(parsedAmount)
      ? Math.min(20, Math.max(1, Math.round(parsedAmount)))
      : 5;

    if (!role || !level) {
      return toolResponse(
        toolCallId,
        name,
        "I still need the job role and the experience level before I can build the interview.",
      );
    }

    // userid arrives via the assistant's variableValues, which the browser
    // supplies, so confirm it's a real account before writing anything under it.
    if (!userid) {
      return toolResponse(
        toolCallId,
        name,
        "Something went wrong identifying your account. Please refresh and try again.",
      );
    }

    const userDoc = await db.collection("users").doc(userid).get();
    if (!userDoc.exists) {
      return toolResponse(
        toolCallId,
        name,
        "Something went wrong identifying your account. Please refresh and try again.",
      );
    }

    const groqProvider = createGroq({ apiKey: process.env.GROQ_API_KEY! });
    const { text } = await generateText({
      model: groqProvider("llama-3.3-70b-versatile"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack.join(", ") || "general"}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]`,
    });

    let parsedQuestions: string[] = [];
    try {
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      const candidate = JSON.parse(cleaned);
      if (Array.isArray(candidate)) {
        parsedQuestions = candidate.map((q) => String(q)).filter(Boolean);
      }
    } catch {
      parsedQuestions = [];
    }

    if (parsedQuestions.length === 0) {
      return toolResponse(
        toolCallId,
        name,
        "I couldn't put the questions together just then. Could you say the role once more?",
      );
    }

    await db.collection("interviews").add({
      role,
      type,
      level,
      techstack,
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    });

    return toolResponse(
      toolCallId,
      name,
      `The ${role} interview is ready with ${parsedQuestions.length} questions. It's waiting on the home page whenever you want to start it.`,
    );
  } catch (error) {
    console.error("Failed to generate interview", error);
    return toolResponse(
      toolCallId,
      name,
      "Something went wrong building the interview. Please try again in a moment.",
      200,
    );
  }
}
