import React from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/action/auth.action";
import { getFeedbacksByUserId, getInterviewsByUserId } from "@/lib/action/general.action";
import InterviewCard from "@/components/InterviewCard";

export const metadata: Metadata = {
  title: "Feedback History",
  description: "Review detailed interview feedback, strengths, and areas to improve.",
};

const FeedbackPage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-light-400">Please log in to view your feedback history.</p>
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

  return (
    <section className="flex flex-col gap-10 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-light-100 tracking-tight">Your Feedback History</h1>
        <p className="text-light-400">Review detailed feedback and scores from all your past interviews.</p>
      </div>

      <div className="flex flex-col gap-5 mt-4">
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
            <p className="text-light-600 rounded-xl border border-white/10 bg-dark-200/50 px-6 py-8 text-center col-span-full w-full">
              You haven&apos;t received any interview feedback yet. Complete an interview to see your results!
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeedbackPage;
