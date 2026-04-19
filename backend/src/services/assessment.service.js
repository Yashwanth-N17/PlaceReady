import { prisma } from "../config/db.js";
import { AIService } from "./ai.service.js";

export const AssessmentService = {
  async getAll() {
    return await prisma.assessment.findMany({
      orderBy: { createdAt: "desc" }
    });
  },

  async getById(id) {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: { questions: true }
    });
    if (!assessment) throw new Error("Assessment not found");
    return assessment;
  },

  /**
   * Process a student's attempt, calculate score, and update their readiness via AI.
   */
  async processSubmission(userId, assessmentId, submissionData) {
    const { answers, timeTaken, focusLossCount } = submissionData;

    // 1. Fetch assessment data
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: true }
    });

    if (!assessment) throw new Error("Assessment not found");

    // 2. Score calculation
    let correctCount = 0;
    const questions = assessment.questions;
    questions.forEach(q => {
      const studentAns = answers[q.id];
      if (q.type === "MCQ" && Array.isArray(q.options)) {
        if (q.options[studentAns] === q.answer) correctCount++;
      }
    });

    const totalCount = questions.length;
    const score = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

    // 3. Save attempt
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        score,
        correctCount,
        totalCount,
        timeTaken: parseInt(timeTaken) || 0,
        focusLossCount: parseInt(focusLossCount) || 0,
        answers: answers || {},
        user: { connect: { id: userId } },
        assessment: { connect: { id: assessmentId } }
      }
    });

    // 4. Update Readiness Score using AI
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (profile) {
      // Fetch recent 5 scores for trend analysis
      const recentAttempts = await prisma.assessmentAttempt.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { score: true }
      });

      const prediction = await AIService.predictReadiness({
        scores: recentAttempts.map(a => a.score),
        weakAreas: [assessment.subject], // For now just the current subject
        cgpa: profile.cgpa || 7.0,
        focusLossCount: focusLossCount || 0,
        branch: profile.branch || "General",
        currentScore: profile.readinessScore
      });

      await prisma.studentProfile.update({
        where: { userId },
        data: { 
          readinessScore: prediction.score,
          // We could also store prediction.feedback somewhere if we add a column
        }
      });
    }

    return attempt;
  },

  async getStudentHistory(userId) {
    const attempts = await prisma.assessmentAttempt.findMany({
      where: { userId },
      include: { assessment: { select: { title: true, subject: true, type: true } } },
      orderBy: { createdAt: "desc" }
    });

    // Percentile calculations
    return Promise.all(attempts.map(async (a) => {
      const below = await prisma.assessmentAttempt.count({
        where: { assessmentId: a.assessmentId, score: { lt: a.score } }
      });
      const total = await prisma.assessmentAttempt.count({
        where: { assessmentId: a.assessmentId }
      });
      const percentile = total > 1 ? Math.round((below / (total - 1)) * 100) : 100;
      return { ...a, percentile };
    }));
  }
};
