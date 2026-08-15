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
import { ScoreDial, ScoreMeter } from "@/components/ScoreMeter";





const Feedback = async ({ params }: RouteParams ) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/home");

  const feedback = await getFeedbackByInterviewId({ interviewId: id });

  const isoDate = feedback?.createdAt || "N/A";

  return (
  
    <section className="section-feedback">
      <div className="text-center mb-8 flex flex-col items-center gap-2">
        <p className="eyebrow">Session report</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-light-100 tracking-tight capitalize">
          {interview.role}
        </h1>
      </div>

      <div className="flex justify-center mb-8">
        <ScoreDial score={feedback?.totalScore ?? 0} />
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
            Delivery &amp; Presence
          </h2>
          <p className="text-xs text-light-500 -mt-2">
            Estimated from your camera during the interview and visible only to you.
            Lighting, glasses and camera angle all affect these numbers, so read them
            as a rough guide rather than a verdict.
          </p>
          
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
            <div className="mt-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="text-amber-400 mt-1 shrink-0">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-amber-200">Eye contact</span>
                <span className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                  Your face wasn&apos;t visible to the camera in {feedback.behaviorAnalysis.cheatingFlags} samples.
                  If you were reading notes, practise glancing at them less — holding the
                  camera&apos;s eye reads as more confident. If you were well-lit and facing
                  forward the whole time, ignore this; the detector misses faces often.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-dark-200/50 p-6 mb-8">
        <p className="text-light-100 leading-relaxed">{feedback?.finalAssessment}</p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Category breakdown</p>
          <h2 className="text-xl font-extrabold tracking-tight text-light-100">Where the points went</h2>
        </div>
        <div className="flex flex-col gap-3">
          {feedback?.categoryScores?.map((category: any, index: any) => (
            <div key={index} className="panel">
              <ScoreMeter score={category.score} label={category.name} />
              <p className="text-light-400 text-sm mt-3 leading-relaxed">{category.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <div className="panel">
          <div className="flex items-center gap-2 mb-3">
            <span className="size-2 rounded-full bg-tier-strong" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-tier-strong">
              What worked
            </h3>
          </div>
          <ul className="list-none text-light-400 space-y-2 text-sm leading-relaxed">
            {feedback?.strengths?.map((strength: any, index: any) => (
              <li key={index} className="pl-4 relative before:absolute before:left-0 before:top-2 before:size-1.5 before:rounded-full before:bg-tier-strong/60">
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <div className="flex items-center gap-2 mb-3">
            <span className="size-2 rounded-full bg-tier-mid" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-tier-mid">
              Work on this next
            </h3>
          </div>
          <ul className="list-none text-light-400 space-y-2 text-sm leading-relaxed">
            {feedback?.areasForImprovement?.map((area: any, index: any) => (
              <li key={index} className="pl-4 relative before:absolute before:left-0 before:top-2 before:size-1.5 before:rounded-full before:bg-tier-mid/60">
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="buttons">
        <Button className="btn-secondary flex-1" asChild>
          <Link href="/home" className="flex w-full justify-center items-center py-2.5">
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