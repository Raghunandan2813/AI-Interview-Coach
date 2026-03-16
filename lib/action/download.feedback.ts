"use client";

import { jsPDF } from "jspdf";

export function downloadFeedback(feedback: any) {

  const pdf = new jsPDF();

  let y = 20;

  /* HEADER */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(40, 40, 40);

  pdf.text("AI Interview Feedback Report", 20, y);

  y += 10;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");

  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, y);

  y += 15;

  /* TOTAL SCORE BOX */

  pdf.setFillColor(230, 240, 255);
  pdf.rect(20, y - 6, 170, 12, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);

  pdf.text(`Total Score: ${feedback.totalScore}/100`, 25, y + 2);

  y += 20;

  /* CATEGORY SCORES */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);

  pdf.text("Category Evaluation", 20, y);

  y += 10;

  feedback.categoryScores.forEach((cat: any) => {

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);

    pdf.text(`${cat.name} (${cat.score}/100)`, 20, y);

    y += 6;

    pdf.setFont("helvetica", "normal");

    const lines = pdf.splitTextToSize(cat.comment, 170);

    pdf.text(lines, 20, y);

    y += lines.length * 6 + 6;

    if (y > 270) {
      pdf.addPage();
      y = 20;
    }

  });

  /* STRENGTHS */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);

  pdf.text("Strengths", 20, y);

  y += 8;

  pdf.setFont("helvetica", "normal");

  feedback.strengths.forEach((s: string) => {

    const lines = pdf.splitTextToSize("• " + s, 170);

    pdf.text(lines, 20, y);

    y += lines.length * 6;

  });

  y += 10;

  /* IMPROVEMENT SECTION */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);

  pdf.setTextColor(200, 40, 40);

  pdf.text("Areas for Improvement", 20, y);

  pdf.setTextColor(0, 0, 0);

  y += 8;

  feedback.areasForImprovement.forEach((a: string) => {

    pdf.setFillColor(255, 235, 235);
    pdf.rect(18, y - 5, 174, 10, "F");

    pdf.setFont("helvetica", "normal");

    const lines = pdf.splitTextToSize("#" + a, 165);

    pdf.text(lines, 20, y);

    y += lines.length * 6 + 4;

  });

  y += 10;

  /* FINAL ASSESSMENT */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);

  pdf.text("Final Assessment", 20, y);

  y += 8;

  pdf.setFont("helvetica", "normal");

  const assessment = pdf.splitTextToSize(feedback.finalAssessment, 170);

  pdf.text(assessment, 20, y);

  /* SAVE PDF */

  pdf.save("interview-feedback.pdf");
}