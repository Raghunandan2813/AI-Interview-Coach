"use server";

import { db } from "@/firebase/admin";

export type LeaderboardEntry = {
  id: string;
  name: string;
  totalScore: number;
  interviewsCompleted: number;
  badges: string[];
};

export async function getLeaderboard(limitCount: number = 50): Promise<{ success: true; data: LeaderboardEntry[] } | { success: false; error: string }> {
  try {
    // Note: In a massive scale app, we would cache this or store an aggregate 'totalInterviewScore' directly on the User document.
    // Since we are pivoting from Quizzes to Interviews mid-way, we will calculate the leaderboards dynamically from all existing Feedbacks!
    
    // 1. Fetch all feedbacks to aggregate scores
    const feedbackSnapshot = await db.collection('feedback').get();
    
    // 2. Group by User ID
    const userAggregates: Record<string, { totalScore: number, count: number }> = {};
    
    feedbackSnapshot.forEach(doc => {
      const data = doc.data();
      const userId = data.userId;
      const score = data.totalScore || 0;
      
      if (!userAggregates[userId]) {
        userAggregates[userId] = { totalScore: 0, count: 0 };
      }
      userAggregates[userId].totalScore += score;
      userAggregates[userId].count += 1;
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
        if (stats.totalScore >= 500) badges.push("Century Club 💯");
        
        // Check for any flawless interviews (score > 95)
        const flawless = feedbackSnapshot.docs.some(doc => doc.data().userId === userId && doc.data().totalScore > 95);
        if (flawless) badges.push("Flawless Communicator 🎙️");

        leaderboard.push({
          id: userId,
          name: userData?.name || 'Anonymous User',
          totalScore: stats.totalScore,
          interviewsCompleted: stats.count,
          badges: badges
        });
      }
    }
    
    // 4. Sort by highest totalScore descending and limit
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    const topLeaderboard = leaderboard.slice(0, limitCount);

    return { success: true, data: topLeaderboard };
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return { success: false, error: "Failed to load leaderboard." };
  }
}
