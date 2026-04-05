"use server";

import { db } from "@/firebase/admin";

export type LeaderboardEntry = {
  id: string;
  name: string;
  averageScore: number;
  interviewsCompleted: number;
  badges: string[];
};

export async function getLeaderboard(limitCount: number = 50): Promise<{ success: true; data: LeaderboardEntry[] } | { success: false; error: string }> {
  try {
    // Note: In a massive scale app, we would cache this or store an aggregate 'totalInterviewScore' directly on the User document.
    // Since we are pivoting from Quizzes to Interviews mid-way, we will calculate the leaderboards dynamically from all existing Feedbacks!
    
    // 1. Fetch all feedbacks to aggregate scores
    const feedbackSnapshot = await db.collection('feedback').get();
    
    const userAggregates: Record<string, { totalScore: number, count: number, highestScore: number, hasFlags: boolean }> = {};
    
    feedbackSnapshot.forEach(doc => {
      const data = doc.data();
      const userId = data.userId;
      const score = data.totalScore || 0;
      const behaviorAnalysis = data.behaviorAnalysis;
      const flags = behaviorAnalysis?.cheatingFlags;
      const hasFlagsInThisInterview = flags && Array.isArray(flags) && flags.length > 0;
      
      if (!userAggregates[userId]) {
        userAggregates[userId] = { totalScore: 0, count: 0, highestScore: 0, hasFlags: false };
      }
      userAggregates[userId].totalScore += score;
      userAggregates[userId].count += 1;
      if (score > userAggregates[userId].highestScore) {
        userAggregates[userId].highestScore = score;
      }
      if (hasFlagsInThisInterview) {
        userAggregates[userId].hasFlags = true;
      }
    });
    
    // 3. fetch User Profiles to map names
    const leaderboard: LeaderboardEntry[] = [];
    
    for (const [userId, stats] of Object.entries(userAggregates)) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        
        // Generate Dynamic Badges based on Interview Competence!
        const badges: string[] = [];
        if (stats.count >= 5) badges.push("Consistency 📈");
        if (stats.highestScore >= 95) badges.push("Top Performer 💯");
        
        // Flag-based achievements
        if (stats.hasFlags) {
          badges.push("Flagged (Moving/Cheating) 🚩");
        } else {
          badges.push("Authentic 🛡️");
        }

        // Check for any flawless interviews (score > 95)
        const flawless = stats.highestScore > 95;
        if (flawless) badges.push("Flawless Communicator 🎙️");

        const averageScore = Math.round(stats.totalScore / stats.count);

        leaderboard.push({
          id: userId,
          name: userData?.name || 'Anonymous User',
          averageScore: averageScore,
          interviewsCompleted: stats.count,
          badges: badges
        });
      }
    }
    
    // 4. Sort by highest averageScore descending and limit
    leaderboard.sort((a, b) => b.averageScore - a.averageScore);
    const topLeaderboard = leaderboard.slice(0, limitCount);

    return { success: true, data: topLeaderboard };
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return { success: false, error: "Failed to load leaderboard." };
  }
}
