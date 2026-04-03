import React from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/action/auth.action";
import { getFeedbacksByUserId, getInterviewsByUserId } from "@/lib/action/general.action";
import ProgressChart from "@/components/ProgressChart";
import InterviewCard from "@/components/InterviewCard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your interview analytics, average score, and progress over time.",
};

const Dashboard = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-light-400">Please log in to view your dashboard.</p>
      </div>
    );
  }

  const userFeedbacks = (await getFeedbacksByUserId(user.id)) || [];
  const userInterviews = (await getInterviewsByUserId(user.id)) || [];
  const interviewMap = new Map(userInterviews.map((interview) => [interview.id, interview]));

  const validPairs = userFeedbacks.map((feedback, index) => {
    const interview = interviewMap.get(feedback.interviewId);
    return interview ? { feedback, interview } : null;
  }).filter(Boolean) as { feedback: any, interview: any }[];

  const pastInterviews = validPairs.map(p => p.interview);
  const feedbacks = validPairs.map(p => p.feedback);

  // Combine interview data with feedback for the chart and statistics
  let totalScoreSum = 0;
  let validFeedbackCount = 0;

  const chartDataRaw = pastInterviews
    .map((interview, index) => {
      const feedback = feedbacks[index];
      if (feedback?.totalScore) {
        totalScoreSum += feedback.totalScore;
        validFeedbackCount++;
        return {
          date: feedback.createdAt,
          score: feedback.totalScore,
        };
      }
      return null;
    })
    .filter((d) => d !== null) as { date: string; score: number }[];

  const chartData = [...chartDataRaw].reverse();

  const averageScore = validFeedbackCount > 0 
    ? Math.round(totalScoreSum / validFeedbackCount) 
    : 0;

  return (
    <section className="flex flex-col gap-10 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-light-100 tracking-tight">Your Dashboard</h1>
        <p className="text-light-400">Track your interview performance and progress over time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-dark-200/50 shadow-sm">
          <span className="text-sm font-medium text-light-400">Total Interviews Taken</span>
          <span className="text-4xl font-bold text-primary-200 mt-2">{pastInterviews.length}</span>
        </div>
        <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-dark-200/50 shadow-sm">
          <span className="text-sm font-medium text-light-400">Average Score</span>
          <span className="text-4xl font-bold text-primary-200 mt-2">{averageScore}</span>
        </div>
        <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-dark-200/50 shadow-sm">
          <span className="text-sm font-medium text-light-400">Highest Score</span>
          <span className="text-4xl font-bold text-primary-200 mt-2">
            {chartData.length > 0 ? Math.max(...chartData.map(d => d.score)) : 0}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold text-light-100">Performance Over Time</h2>
        <ProgressChart data={chartData} />
      </div>

      <div className="flex flex-col gap-5 mt-4">
        <h2 className="text-xl font-semibold text-light-100">Past Interviews</h2>
        <div className="interviews-section">
          {pastInterviews.length > 0 ? (
            pastInterviews.map((interview, index) => (
              <InterviewCard 
                {...interview} 
                key={feedbacks[index].id} 
                feedback={feedbacks[index]} 
              />
            ))
          ) : (
            <p className="text-light-600 rounded-xl border border-white/10 bg-dark-200/50 px-6 py-8 text-center col-span-full">
              You haven&apos;t taken any interviews yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
