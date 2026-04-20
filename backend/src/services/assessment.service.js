import { prisma } from "../config/db.js";
import { AIService } from "./ai.service.js";
import { NotificationService } from "./notification.service.js";

export const AssessmentService = {
  async getAll(userId = null) {
    const include = {
      _count: { select: { questions: true } },
      createdBy: { select: { name: true } }
    };
    
    if (userId) {
      include.attempts = { where: { userId }, select: { id: true } };
    }

    const assessments = await prisma.assessment.findMany({
      include,
      orderBy: { createdAt: "desc" }
    });

    return assessments.map(a => ({
      ...a,
      questionsCount: a._count.questions,
      scheduledBy: a.createdBy?.name || "Faculty",
      date: a.scheduledAt,
      durationMin: a.duration || 60,
      status: userId && a.attempts?.length > 0 ? "completed" : "upcoming",
      hasAttempted: userId ? a.attempts?.length > 0 : false
    }));
  },

  async releaseResults(assessmentId) {
    const assessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: { resultsReleased: true },
      include: { 
        attempts: { 
          select: { userId: true, score: true } 
        } 
      }
    });

    // 1. Notify all students who attempted
    const studentIds = [...new Set(assessment.attempts.map(a => a.userId))];
    const notificationPromises = studentIds.map(sid => 
      NotificationService.createNotification(sid, {
        title: "Results Released",
        message: `Results for '${assessment.title}' are now available. Check your performance dashboard!`,
        type: "marks"
      })
    );
    await Promise.all(notificationPromises);

    // 2. Trigger background AI readiness updates for participants
    // We do this in the background (no await for the whole loop) to keep the response fast
    studentIds.forEach(async (userId) => {
      try {
        const profile = await prisma.studentProfile.findUnique({
          where: { userId },
          select: { cgpa: true, branch: true, readinessScore: true }
        });

        const recentAttempts = await prisma.assessmentAttempt.findMany({
          where: { userId },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { score: true }
        });

        const prediction = await AIService.predictReadiness({
          scores: recentAttempts.map(a => a.score),
          weakAreas: [], 
          cgpa: profile?.cgpa || 7.0,
          branch: profile?.branch || "General",
          currentScore: profile?.readinessScore || 0
        });

        await prisma.studentProfile.update({
          where: { userId },
          data: { 
            readinessScore: prediction.score,
            aiFeedback: prediction.feedback
          }
        });
      } catch (err) {
        console.error(`AI Update for student ${userId} failed:`, err.message);
      }
    });

    return assessment;
  },

  async create(payload, creatorId) {
    const { 
      title, description, type, subject, topic, 
      scheduledAt, duration, questions, studentIds 
    } = payload;

    const result = await prisma.assessment.create({
      data: {
        title,
        description,
        type: type || "MCQ",
        subject,
        topic,
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration) || 60,
        createdBy: { connect: { id: creatorId } },
        students: {
          connect: (studentIds || []).map(id => ({ id }))
        },
        questions: {
          create: (questions || []).map(q => ({
            text: q.text || q.question_text,
            answer: String(q.answer || ""),
            options: q.options || null,
            difficulty: q.difficulty || "MEDIUM",
            type: q.type || "MCQ",
            subject: q.subject || subject,
            topic: q.topic || topic,
            uploadedBy: { connect: { id: creatorId } }
          }))
        }
      },
      include: { questions: true }
    });

    // Notify assigned students
    if (studentIds && studentIds.length > 0) {
      try {
        const notificationPromises = studentIds.map(sid => 
          NotificationService.createNotification(sid, {
            title: "New Assessment Scheduled",
            message: `A new ${type || "test"} '${title}' has been scheduled for ${subject}.`,
            type: "test"
          })
        );
        await Promise.all(notificationPromises);
      } catch (notifErr) {
        console.error("Notification error:", notifErr.message);
      }
    }

    return result;
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
    try {
      const { answers, timeTaken, focusLossCount } = submissionData;

      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: { questions: true }
      });

      if (!assessment) throw new Error("Assessment not found");

      let correctCount = 0;
      const questions = assessment.questions;
      questions.forEach(q => {
        const studentAns = answers[q.id];
        if (q.type === "MCQ" && Array.isArray(q.options) && studentAns !== undefined) {
          const optionText = q.options[studentAns];
          if (optionText === q.answer || String(studentAns) === String(q.answer)) {
            correctCount++;
          }
        }
      });

      const mcqCount = questions.filter(q => q.type === "MCQ").length;
      const score = mcqCount > 0 ? (correctCount / mcqCount) * 100 : 0;

      const attempt = await prisma.assessmentAttempt.create({
        data: {
          score,
          correctCount,
          totalCount: questions.length,
          timeTaken: parseInt(timeTaken) || 0,
          focusLossCount: parseInt(focusLossCount) || 0,
          answers: answers || {},
          user: { connect: { id: userId } },
          assessment: { connect: { id: assessmentId } }
        },
        include: { user: { select: { name: true } } }
      });

      // Notify assessment creator (faculty)
      if (assessment.createdById) {
        try {
          await NotificationService.createNotification(assessment.createdById, {
            title: "New Submission",
            message: `${attempt.user?.name || "A student"} submitted '${assessment.title}'. Click to review.`,
            type: "test" // using 'test' type for faculty alerts
          });
        } catch (notifErr) {
          console.error("Faculty notification failed:", notifErr);
        }
      }

      return attempt;
    } catch (err) {
      require('fs').appendFileSync('debug-submit.log', String(err.stack) + '\n');
      throw err;
    }
  },

  async assignMarks(attemptId, marksData) {
    const { score, correctCount } = marksData;
    
    const attempt = await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { score, correctCount },
      include: { user: true }
    });

    // Re-trigger AI update since score changed
    try {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: attempt.userId } });
      if (profile) {
        const recentAttempts = await prisma.assessmentAttempt.findMany({
          where: { userId: attempt.userId },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { score: true }
        });

        const prediction = await AIService.predictReadiness({
          scores: recentAttempts.map(a => a.score),
          weakAreas: [], 
          cgpa: profile.cgpa || 7.0,
          branch: profile.branch || "General",
          currentScore: profile.readinessScore
        });

        await prisma.studentProfile.update({
          where: { userId: attempt.userId },
          data: { 
            readinessScore: prediction.score,
            aiFeedback: prediction.feedback
          }
        });
      }
    } catch (err) {
      console.error("AI Update after marking failed:", err.message);
    }

    return attempt;
  },

  async getStudentHistory(userId) {
    const attempts = await prisma.assessmentAttempt.findMany({
      where: { userId },
      include: { 
        assessment: { 
          select: { title: true, subject: true, type: true, resultsReleased: true } 
        } 
      },
      orderBy: { createdAt: "desc" }
    });

    // Percentile calculations (only for released results)
    return Promise.all(attempts.map(async (a) => {
      if (!a.assessment.resultsReleased) {
        return { 
          ...a, 
          score: null, 
          percentile: null, 
          status: "Pending Release",
          isReleased: false 
        };
      }

      const below = await prisma.assessmentAttempt.count({
        where: { assessmentId: a.assessmentId, score: { lt: a.score } }
      });
      const total = await prisma.assessmentAttempt.count({
        where: { assessmentId: a.assessmentId }
      });
      const percentile = total > 1 ? Math.round((below / (total - 1)) * 100) : 100;
      return { ...a, percentile, isReleased: true };
    }));
  }
};
