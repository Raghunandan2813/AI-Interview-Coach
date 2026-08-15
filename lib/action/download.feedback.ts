"use client";

import { jsPDF } from "jspdf";

export function downloadFeedback(feedback: any) {
  const pdf = new jsPDF();
  let y = 20;

  // Helper to manage dynamic page breaks
  const checkPageBreak = (neededSpace: number) => {
    if (y + neededSpace > 280) {
      pdf.addPage();
      y = 20;
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                             BRANDING HEADER                                */
  /* -------------------------------------------------------------------------- */
  pdf.setFillColor(28, 28, 34); 
  pdf.rect(0, 0, 210, 40, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Interview Coach // Feedback Report", 20, 25);

  y = 55;

  /* -------------------------------------------------------------------------- */
  /*                                OVERVIEW                                    */
  /* -------------------------------------------------------------------------- */
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Date of Assessment: ${new Date().toLocaleDateString()}`, 20, y);
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(40, 40, 40);
  pdf.text("Overall Score", 150, y - 5);
  
  pdf.setFontSize(26);
  pdf.setTextColor(114, 137, 218); // Modern purple/blue
  pdf.text(`${feedback.totalScore} / 100`, 150, y + 5);

  y += 20;

  /* -------------------------------------------------------------------------- */
  /*                            BEHAVIORAL ANALYSIS                             */
  /* -------------------------------------------------------------------------- */
  if (feedback.behaviorAnalysis) {
    checkPageBreak(30);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(40, 40, 40);
    pdf.text("Delivery & Presence", 20, y);
    
    pdf.setDrawColor(220, 220, 220);
    pdf.line(20, y + 4, 190, y + 4);
    y += 12;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    
    pdf.text(`Confidence: ${feedback.behaviorAnalysis.confidentScore}%`, 20, y);
    pdf.text(`Nervousness: ${feedback.behaviorAnalysis.nervousScore}%`, 80, y);
    
    if (feedback.behaviorAnalysis.cheatingFlags > 0) {
      pdf.setTextColor(180, 120, 20);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Face not visible: ${feedback.behaviorAnalysis.cheatingFlags} samples`, 140, y);
    }
    y += 18;
  }

  /* -------------------------------------------------------------------------- */
  /*                            CATEGORY BREAKDOWN                              */
  /* -------------------------------------------------------------------------- */
  checkPageBreak(25);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(40, 40, 40);
  pdf.text("Category Breakdown", 20, y);
  
  pdf.setDrawColor(220, 220, 220);
  pdf.line(20, y + 4, 190, y + 4);
  y += 12;

  feedback.categoryScores.forEach((cat: any) => {
    checkPageBreak(25);
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(40, 40, 40);
    pdf.text(`${cat.name}: ${cat.score}/100`, 20, y);
    y += 6;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    
    const lines = pdf.splitTextToSize(cat.comment, 170);
    pdf.text(lines, 20, y);
    y += lines.length * 5 + 8;
  });

  /* -------------------------------------------------------------------------- */
  /*                        STRENGTHS & IMPROVEMENTS                            */
  /* -------------------------------------------------------------------------- */
  checkPageBreak(40);
  
  // Left Column (Strengths) & Right Column (Improvements)
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(40, 40, 40);
  
  pdf.text("Strengths", 20, y);
  pdf.text("Areas for Improvement", 110, y);
  
  pdf.line(20, y + 4, 95, y + 4); 
  pdf.line(110, y + 4, 190, y + 4);
  
  y += 12;

  let leftY = y;
  let rightY = y;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  // Format Strengths
  pdf.setTextColor(39, 174, 96); // Green text
  feedback.strengths.forEach((s: string) => {
    checkPageBreak(15);
    const lines = pdf.splitTextToSize("• " + s, 80);
    pdf.text(lines, 20, leftY);
    leftY += lines.length * 5 + 3;
  });

  // Format Improvements
  pdf.setTextColor(211, 84, 0); // Orange/Red text
  feedback.areasForImprovement.forEach((a: string) => {
    checkPageBreak(15);
    const lines = pdf.splitTextToSize("• " + a, 80);
    pdf.text(lines, 110, rightY);
    rightY += lines.length * 5 + 3;
  });

  y = Math.max(leftY, rightY) + 20;

  /* -------------------------------------------------------------------------- */
  /*                            FINAL ASSESSMENT                                */
  /* -------------------------------------------------------------------------- */
  checkPageBreak(50);
  
  const assessmentLines = pdf.splitTextToSize(feedback.finalAssessment, 160);
  const boxHeight = 25 + (assessmentLines.length * 5);
  
  // Draw light grey background box
  pdf.setFillColor(248, 249, 250);
  pdf.rect(15, y, 180, boxHeight, "F"); 
  
  // Left colored border accent
  pdf.setFillColor(114, 137, 218);
  pdf.rect(15, y, 3, boxHeight, "F");

  // Title inside box
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(40, 40, 40);
  pdf.text("Final Assessment", 25, y + 12);
  
  // Text inside box
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(70, 70, 70);
  pdf.text(assessmentLines, 25, y + 22);

  /* -------------------------------------------------------------------------- */
  /*                                SAVE FILE                                   */
  /* -------------------------------------------------------------------------- */
  pdf.save("Interview-Coach-Feedback.pdf");
}