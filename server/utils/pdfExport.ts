// server/utils/pdfExport.ts
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import path from 'path';
import fs from 'fs';


// ============================================
// INTERFACES
// ============================================


interface QuizData {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  total_marks: number;
  passing_marks: number;
  created_at: string;
}


interface QuestionData {
  id: number;
  questionType: string;
  question: string;
  questionImage?: string | null;
  options: string[];
  correctAnswer: number | number[];
  explanation?: string | null;
  marks: number;
  negativeMarks?: number;
  difficulty?: string;
  orderIndex: number;
}


interface ResultData {
  id: number;
  user_id: number;
  quiz_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  skipped_answers: number;
  time_taken: number;
  is_passed: number;
  percentage: number;
  rank?: number;
  completed_at: string;
  userName?: string;
  userEmail?: string;
  quizTitle?: string;
}


interface QuizStatistics {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageTimeTaken: number;
  highestScore: number;
  lowestScore: number;
}


// ============================================
// PDF STYLING CONSTANTS
// ============================================


const COLORS = {
  primary: '#7C3AED',        // Purple
  primaryDark: '#6D28D9',
  primaryLight: '#A78BFA',
  accent: '#FCD34D',         // Golden yellow
  success: '#10B981',        // Emerald/Green
  danger: '#EF4444',         // Red
  dark: '#1F2937',
  slate: '#64748B',
  slateLight: '#94A3B8',
  bgLight: '#F3F4F6',
  bgPurpleLight: '#EDE9FE',
  white: '#FFFFFF',
};


const FONTS = {
  bold: 'Helvetica-Bold',
  regular: 'Helvetica',
  italic: 'Helvetica-Oblique',
};


// ============================================
// HELPER FUNCTIONS
// ============================================


/**
 * ✨ Add exact header matching the image
 */
function addExactHeader(doc: typeof PDFDocument) {
  // Purple gradient background
  doc.rect(0, 0, 595, 50).fill(COLORS.primary);

  // Left "UU" logo circle
  doc
    .circle(38, 25, 15)
    .fillOpacity(0.3)
    .fill(COLORS.white)
    .strokeColor(COLORS.white)
    .lineWidth(1.5)
    .stroke()
    .fillOpacity(1);

  doc
    .fontSize(11)
    .font(FONTS.bold)
    .fillColor(COLORS.white)
    .text('UU', 30, 18);

  // Right "UU" logo circle
  doc
    .circle(557, 25, 15)
    .fillOpacity(0.3)
    .fill(COLORS.white)
    .strokeColor(COLORS.white)
    .lineWidth(1.5)
    .stroke()
    .fillOpacity(1);

  doc
    .fontSize(11)
    .font(FONTS.bold)
    .fillColor(COLORS.white)
    .text('UU', 549, 18);

  // Decorative lines before UnchiUdaan
  doc
    .moveTo(70, 22)
    .lineTo(140, 22)
    .strokeColor(COLORS.white)
    .lineWidth(1)
    .stroke();

  // Main "UnchiUdaan" title
  doc
    .fontSize(28)
    .font(FONTS.bold)
    .fillColor(COLORS.white)
    .text('UnchiUdaan', 155, 11, { align: 'center', width: 285 });

  // Decorative lines after UnchiUdaan
  doc
    .moveTo(455, 22)
    .lineTo(525, 22)
    .strokeColor(COLORS.white)
    .lineWidth(1)
    .stroke();

  // Tagline "✦ Gateway to Success ✦"
  doc
    .fontSize(11)
    .font(FONTS.italic)
    .fillColor('#E9D5FF')
    .text('✦ Gateway to Success ✦', 0, 36, { align: 'center', width: 595 });

  // Golden accent line
  doc.rect(0, 50, 595, 3).fill(COLORS.accent);

  return 60; // Return Y position after header
}


/**
 * 💧 Add watermark (optional)
 */
function addWatermark(doc: typeof PDFDocument, logoPath?: string) {
  if (logoPath && fs.existsSync(logoPath)) {
    try {
      doc
        .opacity(0.05)
        .image(logoPath, 200, 300, { width: 195, height: 195 })
        .opacity(1);
    } catch (err) {
      console.log('Watermark not found');
    }
  }
}


/**
 * 👣 Add exact footer matching the image
 */
function addExactFooter(doc: typeof PDFDocument, pageNumber: number) {
  const bottomY = doc.page.height - 40;

  // Brand name on left
  doc
    .fontSize(8)
    .font(FONTS.bold)
    .fillColor(COLORS.primary)
    .text('UnchiUdaan', 40, bottomY);

  doc
    .fontSize(6.5)
    .font(FONTS.italic)
    .fillColor(COLORS.slateLight)
    .text('Gateway to Success', 40, bottomY + 10);

  // Contact details in center
  doc
    .fontSize(6)
    .font(FONTS.regular)
    .fillColor(COLORS.slate);

  doc.text('📧 contact@unchiudaan.com', 150, bottomY);
  doc.text('📱 +91-98X-XXX-44710', 270, bottomY);
  doc.text('💬 WhatsApp: +91-98X-XXX-44710', 150, bottomY + 10);
  doc.text('✈️ @unchiudaan', 310, bottomY + 10);

  // Page number on right
  doc
    .fontSize(7)
    .font(FONTS.regular)
    .fillColor(COLORS.slate)
    .text(`Page ${pageNumber}`, 520, bottomY);

  // Copyright
  doc
    .fontSize(6)
    .fillColor(COLORS.slateLight)
    .text('© 2024 UnchiUdaan. All Rights Reserved. | www.unchiudaan.com', 0, bottomY + 22, {
      align: 'center',
      width: 595,
    });

  // Purple gradient bottom bar
  doc.rect(0, doc.page.height - 3, 595, 3).fill(COLORS.primary);
}


/**
 * Format time
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}


/**
 * Format date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}


/**
 * Get correct answer text
 */
function getCorrectAnswerText(
  correctAnswer: number | number[],
  options: string[],
  questionType: string
): string {
  if (questionType === 'true_false') {
    return typeof correctAnswer === 'number' ? options[correctAnswer] : 'N/A';
  }

  if (questionType === 'multiple_answer' && Array.isArray(correctAnswer)) {
    return correctAnswer
      .map((idx) => `${String.fromCharCode(65 + idx)}) ${options[idx]}`)
      .join(', ');
  }

  if (typeof correctAnswer === 'number') {
    return `${String.fromCharCode(65 + correctAnswer)}) ${options[correctAnswer]}`;
  }

  return 'N/A';
}


// ============================================
// ✨ EXPORT QUIZ RESULTS - EXACT DESIGN
// ============================================


export async function exportQuizResultsToPDF(
  res: Response,
  quiz: QuizData,
  results: ResultData[],
  statistics?: QuizStatistics,
  logoPath?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="quiz-${quiz.id}-results.pdf"`
      );

      doc.pipe(res);

      // Add watermark
      addWatermark(doc, logoPath);

      // Add header
      let currentY = addExactHeader(doc);

      currentY += 8;

      // Title Section with purple bar
      doc.rect(32, currentY, 3, 15).fill(COLORS.primary);

      doc
        .fontSize(11)
        .font(FONTS.bold)
        .fillColor(COLORS.dark)
        .text('Quiz Results Report', 40, currentY + 2);

      doc
        .fontSize(7)
        .font(FONTS.regular)
        .fillColor(COLORS.slate)
        .text(
          `Generated: ${new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}`,
          450,
          currentY + 4
        );

      currentY += 22;

      // QUIZ DETAILS BOX
      doc
        .rect(32, currentY, 531, 70)
        .fillAndStroke(COLORS.bgPurpleLight, '#C4B5FD');

      currentY += 10;

      // Purple dot indicator
      doc.circle(40, currentY + 3, 2.5).fill(COLORS.primary);

      doc
        .fontSize(7.5)
        .font(FONTS.bold)
        .fillColor(COLORS.primary)
        .text('QUIZ DETAILS', 47, currentY);

      currentY += 14;

      // Quiz info in 2 columns
      const quizDetails = [
        ['Quiz Title:', quiz.title || 'N/A', 'Category:', quiz.category || 'N/A'],
        ['Total Attempts:', results.length.toString(), 'Duration:', `${quiz.duration} min`],
        ['Total Marks:', quiz.total_marks.toString(), 'Passing Marks:', quiz.passing_marks.toString()],
      ];

      quizDetails.forEach(([label1, value1, label2, value2]) => {
        doc
          .fontSize(7)
          .font(FONTS.regular)
          .fillColor(COLORS.slate)
          .text(label1, 50, currentY, { continued: true, width: 80 })
          .font(FONTS.bold)
          .fillColor(COLORS.dark)
          .text(value1, { width: 150 });

        doc
          .fontSize(7)
          .font(FONTS.regular)
          .fillColor(COLORS.slate)
          .text(label2, 310, currentY, { continued: true, width: 80 })
          .font(FONTS.bold)
          .fillColor(COLORS.dark)
          .text(value2);

        currentY += 11;
      });

      currentY += 12;

      // STUDENT RESULTS SECTION
      doc.rect(32, currentY, 3, 12).fill(COLORS.primary);

      doc
        .fontSize(10)
        .font(FONTS.bold)
        .fillColor(COLORS.dark)
        .text('Student Results', 40, currentY + 1);

      currentY += 18;

      // Table Header
      const headers = ['#', 'Name', 'Email', 'Marks', 'Time', 'Result', 'Date'];
      const colWidths = [30, 90, 140, 55, 55, 50, 75];

      // Purple gradient header
      doc.rect(32, currentY, 531, 20).fill(COLORS.primary);

      let colX = 32;
      doc.fontSize(7.5).font(FONTS.bold).fillColor(COLORS.white);

      headers.forEach((header, index) => {
        const align = index === 0 || index === 3 || index === 4 || index === 5 || index === 6 ? 'center' : 'left';
        doc.text(header, colX + 3, currentY + 6, {
          width: colWidths[index] - 6,
          align: align,
        });
        colX += colWidths[index];
      });

      currentY += 20;

      // Table Rows
      results.forEach((result, index) => {
        if (currentY > 690) {
          addExactFooter(doc, doc.bufferedPageRange().count);
          doc.addPage();
          addWatermark(doc, logoPath);
          currentY = 50;
        }

        colX = 32;

        const rowData = [
          (index + 1).toString(),
          (result.userName || 'N/A').substring(0, 18),
          (result.userEmail || 'N/A').substring(0, 25),
          `${result.score}/${quiz.total_marks}`,
          formatTime(result.time_taken),
          result.is_passed ? 'PASS' : 'FAIL',
          formatDate(result.completed_at),
        ];

        // Alternating row background
        const bgColor = index % 2 === 0 ? COLORS.white : '#F9FAFB';
        doc.rect(32, currentY, 531, 18).fill(bgColor);

        // Row border
        doc
          .rect(32, currentY, 531, 18)
          .strokeColor('#E5E7EB')
          .lineWidth(0.3)
          .stroke();

        // Row data
        rowData.forEach((data, colIndex) => {
          if (colIndex === 5) {
            // Result badge
            const isPass = result.is_passed;
            const badgeBg = isPass ? '#D1FAE5' : '#FEE2E2';
            const badgeColor = isPass ? COLORS.success : COLORS.danger;

            doc
              .rect(colX + 8, currentY + 4, 34, 10)
              .fill(badgeBg);

            doc
              .fontSize(6.5)
              .font(FONTS.bold)
              .fillColor(badgeColor)
              .text(data, colX + 3, currentY + 5.5, {
                width: colWidths[colIndex] - 6,
                align: 'center',
              });
          } else if (colIndex === 3) {
            // Marks in purple
            doc
              .fontSize(7)
              .font(FONTS.bold)
              .fillColor(COLORS.primary)
              .text(data, colX + 3, currentY + 5, {
                width: colWidths[colIndex] - 6,
                align: 'center',
              });
          } else {
            const align = colIndex === 0 || colIndex === 4 || colIndex === 6 ? 'center' : 'left';
            doc
              .fontSize(7)
              .font(colIndex === 1 ? FONTS.bold : FONTS.regular)
              .fillColor(colIndex === 1 ? COLORS.dark : COLORS.slate)
              .text(data, colX + 3, currentY + 5, {
                width: colWidths[colIndex] - 6,
                align: align,
                ellipsis: true,
              });
          }

          colX += colWidths[colIndex];
        });

        currentY += 18;
      });

      currentY += 8;

      // STATISTICS CARDS
      if (statistics) {
        const cardWidth = 128;
        const cardHeight = 48;
        const gap = 5;

        const stats = [
          {
            value: results.length.toString(),
            label: 'Total Attempts',
            bg: '#DDD6FE',
            color: COLORS.primary,
          },
          {
            value: `${statistics.averageScore.toFixed(1)}%`,
            label: 'Avg Score',
            bg: '#D1FAE5',
            color: COLORS.success,
          },
          {
            value: `${statistics.passRate.toFixed(1)}%`,
            label: 'Pass Rate',
            bg: '#E9D5FF',
            color: COLORS.primaryDark,
          },
          {
            value: formatTime(Math.round(statistics.averageTimeTaken)),
            label: 'Avg Time',
            bg: '#FEF3C7',
            color: '#D97706',
          },
        ];

        let statX = 32;
        stats.forEach((stat) => {
          // Card
          doc
            .rect(statX, currentY, cardWidth, cardHeight)
            .fill(stat.bg);

          // Value
          doc
            .fontSize(16)
            .font(FONTS.bold)
            .fillColor(stat.color)
            .text(stat.value, statX, currentY + 10, {
              width: cardWidth,
              align: 'center',
            });

          // Label
          doc
            .fontSize(7)
            .font(FONTS.regular)
            .fillColor(COLORS.slate)
            .text(stat.label, statX, currentY + 32, {
              width: cardWidth,
              align: 'center',
            });

          statX += cardWidth + gap;
        });

        currentY += cardHeight + 10;
      }

      // Add footer
      addExactFooter(doc, 1);

      doc.end();

      doc.on('finish', () => resolve());
      doc.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}


// ============================================
// ✨ EXPORT SINGLE STUDENT RESULT
// ============================================


export async function exportStudentResultToPDF(
  res: Response,
  quiz: QuizData,
  result: ResultData,
  questions: QuestionData[],
  userAnswers: any[],
  logoPath?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="result-${result.id}.pdf"`
      );

      doc.pipe(res);

      addWatermark(doc, logoPath);
      let currentY = addExactHeader(doc);

      currentY += 8;

      // Title
      doc.rect(32, currentY, 3, 15).fill(COLORS.primary);
      doc
        .fontSize(11)
        .font(FONTS.bold)
        .fillColor(COLORS.dark)
        .text('Quiz Result Certificate', 40, currentY + 2);

      currentY += 22;

      // Student Info
      doc
        .rect(32, currentY, 531, 60)
        .fillAndStroke(COLORS.bgPurpleLight, '#C4B5FD');

      currentY += 10;

      doc.circle(40, currentY + 3, 2.5).fill(COLORS.primary);
      doc
        .fontSize(7.5)
        .font(FONTS.bold)
        .fillColor(COLORS.primary)
        .text('STUDENT INFORMATION', 47, currentY);

      currentY += 14;

      doc
        .fontSize(7)
        .font(FONTS.regular)
        .fillColor(COLORS.slate)
        .text('Name: ', 50, currentY, { continued: true })
        .font(FONTS.bold)
        .fillColor(COLORS.dark)
        .text(result.userName || 'N/A');

      doc
        .fontSize(7)
        .font(FONTS.regular)
        .fillColor(COLORS.slate)
        .text('Date: ', 310, currentY, { continued: true })
        .font(FONTS.bold)
        .fillColor(COLORS.dark)
        .text(formatDate(result.completed_at));

      currentY += 12;

      doc
        .fontSize(7)
        .font(FONTS.regular)
        .fillColor(COLORS.slate)
        .text('Email: ', 50, currentY, { continued: true })
        .font(FONTS.bold)
        .fillColor(COLORS.dark)
        .text(result.userEmail || 'N/A');

      currentY += 18;

      // Score Card
      const passed = result.is_passed === 1;
      const scoreColor = passed ? COLORS.success : COLORS.danger;
      const scoreBg = passed ? '#D1FAE5' : '#FEE2E2';

      doc.rect(32, currentY, 531, 85).fillAndStroke(scoreBg, scoreColor);

      currentY += 12;

      doc
        .fontSize(14)
        .font(FONTS.bold)
        .fillColor(scoreColor)
        .text(passed ? '✓ PASSED' : '✗ FAILED', 0, currentY, {
          align: 'center',
          width: 595,
        });

      currentY += 22;

      doc
        .fontSize(24)
        .font(FONTS.bold)
        .fillColor(COLORS.dark)
        .text(`${result.score} / ${quiz.total_marks}`, 0, currentY, {
          align: 'center',
          width: 595,
        });

      currentY += 28;

      doc
        .fontSize(10)
        .font(FONTS.regular)
        .fillColor(COLORS.slate)
        .text(`${result.percentage.toFixed(2)}% Achieved`, 0, currentY, {
          align: 'center',
          width: 595,
        });

      currentY += 25;

      // Metrics Box
      doc
        .rect(32, currentY, 531, 40)
        .fillAndStroke('#F9FAFB', '#D1D5DB');

      currentY += 6;

      const metrics = [
        { label: 'Correct', value: result.correct_answers.toString() },
        { label: 'Wrong', value: result.wrong_answers.toString() },
        { label: 'Skipped', value: result.skipped_answers.toString() },
        { label: 'Time', value: formatTime(result.time_taken) },
      ];

      let metricX = 50;
      metrics.forEach(({ label, value }) => {
        doc
          .fontSize(6)
          .font(FONTS.regular)
          .fillColor(COLORS.slate)
          .text(label, metricX, currentY);

        doc
          .fontSize(9)
          .font(FONTS.bold)
          .fillColor(COLORS.primary)
          .text(value, metricX, currentY + 12);

        metricX += 133;
      });

      currentY += 55;

      // Answer Sheet
      if (userAnswers && userAnswers.length > 0) {
        doc.addPage();
        addWatermark(doc, logoPath);
        currentY = addExactHeader(doc);
        currentY += 8;

        doc.rect(32, currentY, 3, 15).fill(COLORS.primary);
        doc
          .fontSize(11)
          .font(FONTS.bold)
          .fillColor(COLORS.dark)
          .text('Answer Sheet', 40, currentY + 2);

        currentY += 22;

        userAnswers.forEach((answer, index) => {
          if (currentY > 700) {
            addExactFooter(doc, doc.bufferedPageRange().count);
            doc.addPage();
            addWatermark(doc, logoPath);
            currentY = 50;
          }

          const question = questions.find((q) => q.id === answer.questionId);
          if (!question) return;

          const isCorrect = answer.isCorrect;

          doc
            .rect(32, currentY, 531, 45)
            .fillAndStroke(COLORS.white, isCorrect ? COLORS.success : COLORS.danger);

          doc
            .fontSize(8)
            .font(FONTS.bold)
            .fillColor(COLORS.dark)
            .text(`Q${index + 1}. ${question.question}`, 42, currentY + 6, {
              width: 510,
            });

          currentY += 25;

          doc
            .fontSize(7)
            .font(FONTS.regular)
            .fillColor(COLORS.slate)
            .text('Your Answer: ', 42, currentY, { continued: true })
            .fillColor(isCorrect ? COLORS.success : COLORS.danger)
            .font(FONTS.bold)
            .text(
              answer.selectedAnswer !== null && answer.selectedAnswer !== undefined
                ? `${String.fromCharCode(65 + answer.selectedAnswer)}) ${
                    question.options[answer.selectedAnswer]
                  }`
                : 'Not Answered'
            );

          if (!isCorrect) {
            currentY += 10;
            doc
              .fontSize(7)
              .font(FONTS.regular)
              .fillColor(COLORS.slate)
              .text('Correct Answer: ', 42, currentY, { continued: true })
              .fillColor(COLORS.success)
              .font(FONTS.bold)
              .text(
                getCorrectAnswerText(
                  question.correctAnswer,
                  question.options,
                  question.questionType
                )
              );
          }

          currentY += 15;
        });
      }

      addExactFooter(doc, doc.bufferedPageRange().count);

      doc.end();

      doc.on('finish', () => resolve());
      doc.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}


// ============================================
// ✨ EXPORT QUIZ QUESTIONS
// ============================================


export async function exportQuizQuestionsToPDF(
  res: Response,
  quiz: QuizData,
  questions: QuestionData[],
  logoPath?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="quiz-${quiz.id}-questions.pdf"`
      );

      doc.pipe(res);

      addWatermark(doc, logoPath);
      let currentY = addExactHeader(doc);

      currentY += 8;

      doc.rect(32, currentY, 3, 15).fill(COLORS.primary);
      doc
        .fontSize(11)
        .font(FONTS.bold)
        .fillColor(COLORS.dark)
        .text('Quiz Questions', 40, currentY + 2);

      currentY += 22;

      // Quiz Info
      doc
        .rect(32, currentY, 531, 60)
        .fillAndStroke(COLORS.bgPurpleLight, '#C4B5FD');

      currentY += 10;

      doc.circle(40, currentY + 3, 2.5).fill(COLORS.primary);
      doc
        .fontSize(7.5)
        .font(FONTS.bold)
        .fillColor(COLORS.primary)
        .text('QUIZ INFORMATION', 47, currentY);

      currentY += 14;

      const infoData = [
        ['Category: ' + quiz.category, 'Difficulty: ' + quiz.difficulty.toUpperCase()],
        ['Duration: ' + quiz.duration + ' min', 'Total Marks: ' + quiz.total_marks.toString()],
        [
          'Passing Marks: ' + quiz.passing_marks.toString(),
          'Questions: ' + questions.length.toString(),
        ],
      ];

      infoData.forEach(([label1, label2]) => {
        doc
          .fontSize(7)
          .font(FONTS.regular)
          .fillColor(COLORS.dark)
          .text(label1, 50, currentY)
          .text(label2, 310, currentY);

        currentY += 10;
      });

      currentY += 10;

      // Questions
      questions.forEach((question, index) => {
        if (currentY > 700) {
          addExactFooter(doc, doc.bufferedPageRange().count);
          doc.addPage();
          addWatermark(doc, logoPath);
          currentY = 50;
        }

        const typeText =
          question.questionType === 'mcq'
            ? 'MCQ'
            : question.questionType === 'true_false'
            ? 'T/F'
            : 'Multi';

        doc
          .rect(32, currentY, 531, 14)
          .fillAndStroke(COLORS.bgPurpleLight, '#C4B5FD');

        doc
          .fontSize(8)
          .font(FONTS.bold)
          .fillColor(COLORS.primary)
          .text(`Q${index + 1}`, 42, currentY + 2);

        doc
          .fontSize(6)
          .fillColor(COLORS.slate)
          .text(`[${typeText}] [${question.marks} mark(s)]`, 515, currentY + 2, {
            align: 'right',
          });

        currentY += 16;

        doc
          .fontSize(8)
          .font(FONTS.regular)
          .fillColor(COLORS.dark)
          .text(question.question, 42, currentY, { width: 510 });

        currentY = doc.y + 5;

        if (question.options && question.options.length > 0) {
          question.options.forEach((option, optIndex) => {
            const isCorrect = Array.isArray(question.correctAnswer)
              ? question.correctAnswer.includes(optIndex)
              : question.correctAnswer === optIndex;

            doc
              .fontSize(7)
              .font(isCorrect ? FONTS.bold : FONTS.regular)
              .fillColor(isCorrect ? COLORS.success : COLORS.dark)
              .text(`${String.fromCharCode(65 + optIndex)}) ${option}`, 52, currentY, {
                width: 500,
              });

            currentY = doc.y + 3;
          });
        }

        currentY += 4;

        doc
          .fontSize(7)
          .font(FONTS.bold)
          .fillColor(COLORS.success)
          .text('✓ Correct: ', 52, currentY, { continued: true })
          .font(FONTS.regular)
          .text(
            getCorrectAnswerText(
              question.correctAnswer,
              question.options,
              question.questionType
            )
          );

        currentY = doc.y + 5;

        if (question.explanation) {
          doc
            .fontSize(6.5)
            .font(FONTS.italic)
            .fillColor(COLORS.slate)
            .text(`💡 ${question.explanation}`, 52, currentY, { width: 500 });

          currentY = doc.y + 5;
        }

        doc
          .moveTo(32, currentY)
          .lineTo(563, currentY)
          .strokeColor('#E0E7FF')
          .lineWidth(1)
          .stroke();

        currentY += 8;
      });

      addExactFooter(doc, doc.bufferedPageRange().count);

      doc.end();

      doc.on('finish', () => resolve());
      doc.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}


// ============================================
// EXPORT FUNCTIONS
// ============================================


export default {
  exportQuizQuestionsToPDF,
  exportQuizResultsToPDF,
  exportStudentResultToPDF,
};
