"use server";

import { unstable_cache } from "next/cache";
import { db } from "@/firebase/admin";

export type LeaderboardEntry = {
  id: string;
  name: string;
  averageScore: number;
  interviewsCompleted: number;
  badges: string[];
};

async function buildLeaderboard(): Promise<LeaderboardEntry[]> {
  // Scores are aggregated from every feedback document. That's acceptable at
  // current scale behind the cache below; past a few thousand users, keep a
  // running totalScore/count on the user document and read that instead.
  const feedbackSnapshot = await db.collection("feedback").get();

  const userAggregates: Record<
    string,
    { totalScore: number; count: number; highestScore: number }
  > = {};

  feedbackSnapshot.forEach((doc) => {
    const data = doc.data();
    const userId = data.userId;
    if (!userId) return;
    const score = data.totalScore || 0;

    if (!userAggregates[userId]) {
      userAggregates[userId] = { totalScore: 0, count: 0, highestScore: 0 };
    }
    userAggregates[userId].totalScore += score;
    userAggregates[userId].count += 1;
    if (score > userAggregates[userId].highestScore) {
      userAggregates[userId].highestScore = score;
    }
  });

  const userIds = Object.keys(userAggregates);
  if (userIds.length === 0) return [];

  // One batched read instead of a query per user. getAll returns snapshots in
  // the order the refs were passed, so they line up with userIds.
  const userRefs = userIds.map((id) => db.collection("users").doc(id));
  const userDocs = await db.getAll(...userRefs);

  const leaderboard: LeaderboardEntry[] = [];

  userDocs.forEach((userDoc, index) => {
    if (!userDoc.exists) return;

    const userId = userIds[index];
    const stats = userAggregates[userId];
    const userData = userDoc.data();

    // Achievements only. Never publish a behavioural judgement next to a real
    // person's name — webcam signals are far too noisy to accuse anyone with,
    // and the focus metric stays private to the candidate's own report.
    const badges: string[] = [];
    if (stats.count >= 5) badges.push("Consistency 📈");
    if (stats.highestScore >= 95) badges.push("Top Performer 💯");
    if (stats.count >= 15) badges.push("Dedicated 🔁");

    leaderboard.push({
      id: userId,
      name: userData?.name || "Anonymous User",
      averageScore: Math.round(stats.totalScore / stats.count),
      interviewsCompleted: stats.count,
      badges,
    });
  });

  leaderboard.sort((a, b) => b.averageScore - a.averageScore);
  return leaderboard;
}

// Every page under (root) reads the session cookie in its layout, so the page
// itself can never be statically cached — a page-level `revalidate` would do
// nothing here. Cache the expensive aggregation instead, which is the part
// that actually costs reads.
const getCachedLeaderboard = unstable_cache(buildLeaderboard, ["leaderboard"], {
  revalidate: 300,
  tags: ["leaderboard"],
});

export async function getLeaderboard(
  limitCount: number = 50,
): Promise<
  { success: true; data: LeaderboardEntry[] } | { success: false; error: string }
> {
  try {
    const leaderboard = await getCachedLeaderboard();
    return { success: true, data: leaderboard.slice(0, limitCount) };
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return { success: false, error: "Failed to load leaderboard." };
  }
}
