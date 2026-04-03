"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";

export type LeaderboardEntry = {
  id: string;
  name: string;
  averageScore: number;
  attempts: number;
  badges: string[];
};

export async function saveQuizScore(score: number): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Must be logged in to save score." };

    const userRef = db.collection('users').doc(user.id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return { success: false, error: "User not found." };
    
    const userData = userDoc.data() || {};
    const currentTotal = userData.totalScore || 0;
    const currentBadges: string[] = userData.badges || [];
    
    const newTotal = currentTotal + score;
    const updatedBadges = new Set(currentBadges);
    
    // Evaluate Badge Logic
    if (score === 5) updatedBadges.add("Perfect Flawless 🏆");
    if (newTotal >= 100) updatedBadges.add("Century Club 💯");
    if (currentTotal === 0 && score > 0) updatedBadges.add("First Blood 🩸");
    if (newTotal >= 50) updatedBadges.add("Quiz Veteran ⚔️");

    await userRef.update({
      totalScore: newTotal,
      badges: Array.from(updatedBadges)
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to save score:", error);
    return { success: false, error: "Failed to persist score." };
  }
}

export async function getLeaderboard(limitCount: number = 100): Promise<{ success: true; data: LeaderboardEntry[] } | { success: false; error: string }> {
  try {
    const feedbackSnapshot = await db.collection("feedback").get();
    const userScoreMap = new Map<string, { total: number; attempts: number }>();

    feedbackSnapshot.forEach((doc) => {
      const data = doc.data();
      const userId = data.userId as string | undefined;
      const score = data.totalScore as number | undefined;

      if (!userId || typeof score !== "number") return;

      const current = userScoreMap.get(userId) ?? { total: 0, attempts: 0 };
      userScoreMap.set(userId, {
        total: current.total + score,
        attempts: current.attempts + 1,
      });
    });

    if (userScoreMap.size === 0) {
      return { success: true, data: [] };
    }

    const leaderboardEntries = await Promise.all(
      Array.from(userScoreMap.entries()).map(async ([userId, scoreData]) => {
        const userDoc = await db.collection("users").doc(userId).get();
        const userData = userDoc.data() || {};
        const averageScore = Number(
          (scoreData.total / scoreData.attempts).toFixed(2),
        );

        return {
          id: userId,
          name: userData.name || "Anonymous User",
          averageScore,
          attempts: scoreData.attempts,
          badges: userData.badges || [],
        } as LeaderboardEntry;
      }),
    );

    const leaderboard = leaderboardEntries
      .sort((a, b) => {
        if (b.averageScore !== a.averageScore) {
          return b.averageScore - a.averageScore;
        }

        return b.attempts - a.attempts;
      })
      .slice(0, limitCount);

    return { success: true, data: leaderboard };
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return { success: false, error: "Failed to load leaderboard." };
  }
}
