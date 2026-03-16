import jsPDF from "jspdf";

export const downloadFeedback = (feedback:any) => {
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("Interview Feedback Report", 20, 20);

  pdf.setFontSize(12);
  pdf.text(`Total Score: ${feedback.totalScore}`, 20, 35);

  let y = 50;

  feedback.categoryScores.forEach((cat : any) => {
    pdf.text(`${cat.name}: ${cat.score}/100`, 20, y);
    y += 8;
    pdf.text(`Comment: ${cat.comment}`, 20, y);
    y += 15;
  });

  pdf.text("Strengths:", 20, y);
  y += 8;

  feedback.strengths.forEach((s : any) => {
    pdf.text(`• ${s}`, 25, y);
    y += 7;
  });

  y += 5;
  pdf.text("Areas for Improvement:", 20, y);
  y += 8;

  feedback.areasForImprovement.forEach((a : any) => {
    pdf.text(`• ${a}`, 25, y);
    y += 7;
  });

  y += 10;
  pdf.text("Final Assessment:", 20, y);
  y += 8;
  pdf.text(feedback.finalAssessment, 20, y);

  pdf.save("interview-feedback.pdf");
};