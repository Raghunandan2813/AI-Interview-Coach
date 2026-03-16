import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import jsPDF from "jspdf";
import { downloadFeedback } from "@/lib/action/downloadFeedback";
import {
  getFeedbackByInterviewId,
  getInterviewById, 
} from  "@/lib/action/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/action/auth.action";
import DownloadFeedbackButton from "@/components/DownloadFeedbackButton";





const Feedback = async ({ params }: RouteParams ) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  return (
    <section className="section-feedback">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-light-100 tracking-tight">
          Feedback — <span className="capitalize text-primary-200">{interview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row flex-wrap justify-center gap-6 mb-8">
        <div className="flex flex-row gap-2 items-center px-4 py-2 rounded-xl bg-dark-200/80 border border-white/10">
          <Image src="/star.svg" width={20} height={20} alt="score" />
          <span className="text-light-400">Score: </span>
          <span className="text-primary-200 font-semibold">{feedback?.totalScore}/100</span>
        </div>
        <div className="flex flex-row gap-2 items-center px-4 py-2 rounded-xl bg-dark-200/80 border border-white/10">
          <Image src="/calendar.svg" width={20} height={20} alt="date" />
          <span className="text-light-400">
            {feedback?.createdAt
              ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
              : "N/A"}
          </span>
        </div>
      </div>

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