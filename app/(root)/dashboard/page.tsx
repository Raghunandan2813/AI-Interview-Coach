import React from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/action/auth.action";
import { getFeedbacksByUserId, getInterviewsByUserId } from "@/lib/action/general.action";
import ProgressChart from "@/components/ProgressChart";
import InterviewCard from "@/components/InterviewCard";
import { ScoreMeter } from "@/components/ScoreMeter";

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

  const userFeedbacks = (await getFeedbacksByUserId()) || [];
  const userInterviews = (await getInterviewsByUserId()) || [];
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

  const highestScore =
    chartData.length > 0 ? Math.max(...chartData.map((d) => d.score)) : 0;

  return (
    <section className="flex flex-col gap-10 pb-10">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">Your record</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-light-100 tracking-tight">
          {user.name?.split(" ")[0] ?? "Your"} stats
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="panel flex flex-col gap-1">
          <span className="eyebrow">Sessions run</span>
          <span className="stat-num text-5xl text-light-100 mt-1">{pastInterviews.length}</span>
        </div>
        <div className="panel flex flex-col gap-1">
          <span className="eyebrow">Average score</span>
          <span className="stat-num text-5xl text-primary-200 mt-1">{averageScore}</span>
          {chartData.length > 0 && (
            <ScoreMeter score={averageScore} className="mt-3" />
          )}
        </div>
        <div className="panel flex flex-col gap-1">
          <span className="eyebrow">Personal best</span>
          <span className="stat-num text-5xl text-heat-200 mt-1">{highestScore}</span>
          {chartData.length > 0 && (
            <ScoreMeter score={highestScore} className="mt-3" />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Trajectory</p>
          <h2 className="text-xl font-extrabold tracking-tight text-light-100">Score over time</h2>
        </div>
        <ProgressChart data={chartData} />
      </div>

      <div className="flex flex-col gap-5 mt-4">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">History</p>
          <h2 className="text-xl font-extrabold tracking-tight text-light-100">Past sessions</h2>
        </div>
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
