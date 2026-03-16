"use client";
import { downloadFeedback } from "@/lib/action/downloadFeedback";

export default function DownloadFeedbackButton({ feedback } : any) {
  return (
    <button
      onClick={() => downloadFeedback(feedback)}
     className="btn-secondary flex-1"
    >
      Download Feedback PDF
    </button>
  );
}