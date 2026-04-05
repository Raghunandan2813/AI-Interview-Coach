import LocalTime from "@/components/LocalTime";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import jsPDF from "jspdf";
import { downloadFeedback } from "@/lib/action/download.feedback";
import {
  getFeedbackByInterviewId,
  getInterviewById, 
} from  "@/lib/action/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/action/auth.action";
import DownloadFeedbackButton from "@/components/DownloadFeedbackButton";
import ShareableResultCard from "@/components/ShareableResultCard";
import ShareButtons from "@/components/ShareButtons";





const Feedback = async ({ params }: RouteParams ) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  const isoDate = feedback?.createdAt || "N/A";

  return (
  
    <section className="section-feedback">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-light-100 tracking-tight">
          Feedback — <span className="capitalize text-primary-200">{interview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-col items-center gap-4 mb-8">
        <ShareableResultCard
          score={feedback?.totalScore || 0}
          role={interview.role}
          date={isoDate}
        />
        <ShareButtons
          score={feedback?.totalScore || 0}
          role={interview.role}
        />
      </div>

      <div className="flex flex-row flex-wrap justify-center gap-6 mb-8">
        <div className="flex flex-row gap-2 items-center px-4 py-2 rounded-xl bg-dark-200/80 border border-white/10">
          <Image src="/star.svg" width={20} height={20} alt="score" />
          <span className="text-light-400">Score: </span>
          <span className="text-primary-200 font-semibold">{feedback?.totalScore}/100</span>
        </div>
        <div className="flex flex-row gap-2 items-center px-4 py-2 rounded-xl bg-dark-200/80 border border-white/10">
          <Image src="/calendar.svg" width={20} height={20} alt="date" />
          <LocalTime date={isoDate} className="text-light-400" />
        </div>
      </div>

      {feedback?.behaviorAnalysis && (
        <div className="flex flex-col gap-4 mb-8 p-6 rounded-2xl border border-white/10 bg-dark-200/50">
          <h2 className="text-lg font-semibold text-light-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="text-primary-200">
              <path d="M9 5a.5.5 0 0 0-1 0v3H6a.5.5 0 0 0 0 1h2.5a.5.5 0 0 0 .5-.5z"/>
              <path d="M4 1.667v.383A2.5 2.5 0 0 0 2 4.5v7a2.5 2.5 0 0 0 2 2.45v.383C4 15.253 4.746 16 5.667 16h4.666C11.253 16 12 15.253 12 14.333v-.383a2.5 2.5 0 0 0 2-2.45v-7a2.5 2.5 0 0 0-2-2.45v-.383C12 .747 11.253 0 10.333 0H5.667C4.747 0 4 .746 4 1.667M4.5 3h7A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3"/>
            </svg>
            Behavioral Analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-light-400">Confidence</span>
                <span className="text-white font-medium">{feedback.behaviorAnalysis.confidentScore}%</span>
              </div>
              <div className="w-full bg-dark-100 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${feedback.behaviorAnalysis.confidentScore}%` }}></div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-light-400">Nervousness</span>
                <span className="text-white font-medium">{feedback.behaviorAnalysis.nervousScore}%</span>
              </div>
              <div className="w-full bg-dark-100 rounded-full h-2.5">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${feedback.behaviorAnalysis.nervousScore}%` }}></div>
              </div>
            </div>
          </div>

          {feedback.behaviorAnalysis.cheatingFlags > 0 && (
            <div className="mt-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="text-red-400 mt-1 shrink-0">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-red-300">Moving or Cheating Flagged</span>
                <span className="text-xs text-red-300/80 mt-1 leading-relaxed">The system flagged {feedback.behaviorAnalysis.cheatingFlags} instances indicating moving or cheating during the camera portion of the interview. You repeatedly looked away from the camera or your face could not be detected.</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-dark-200/50 p-6 mb-8">
        <p className="text-light-100 leading-relaxed">{feedback?.finalAssessment}</p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <h2 className="text-lg font-semibold text-light-100">Breakdown</h2>
        <div className="flex flex-col gap-3">
          {feedback?.categoryScores?.map((category: any, index: any) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-white/10 bg-dark-200/50"
            >
              <p className="font-semibold text-light-100">
                {index + 1}. {category.name} — {category.score}/100
              </p>
              <p className="text-light-400 text-sm mt-1">{category.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <h3 className="text-base font-semibold text-primary-200">Strengths</h3>
        <ul className="list-disc list-inside text-light-400 space-y-1">
          {feedback?.strengths?.map((strength: any, index: any) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3 mb-10">
        <h3 className="text-base font-semibold text-primary-200">Areas for improvement</h3>
        <ul className="list-disc list-inside text-light-400 space-y-1">
          {feedback?.areasForImprovement?.map((area: any, index: any) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      <div className="buttons">
        <Button className="btn-secondary flex-1" asChild>
          <Link href="/" className="flex w-full justify-center items-center py-2.5">
            Back to dashboard
          </Link>
        </Button>
        <Button className="btn-primary flex-1" asChild>
          <Link href={`/interview/${id}`} className="flex w-full justify-center items-center py-2.5">
            Retake interview
          </Link>
        </Button>
        <DownloadFeedbackButton feedback = {feedback}/>
      </div>
    </section>
    
  );
};

export default Feedback;