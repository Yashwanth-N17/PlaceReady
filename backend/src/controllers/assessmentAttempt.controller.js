import { prisma } from "../config/db.js";

export const submitAttempt = async (req, res) => {
  const { assessmentId } = req.params;
  const { answers, timeTaken, focusLossCount } = req.body;
  const userId = req.user.id;

  try {
    // 1. Fetch assessment with questions to calculate score
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: true }
    });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // 2. Automated Scoring (MCQ only)
    let correctCount = 0;
    const questions = assessment.questions;
    const totalCount = questions.length;

    questions.forEach(q => {
      const studentAnswer = answers[q.id];
      // Note: We expect studentAnswer to be the index (0, 1, 2, 3) 
      // or the text if we decide to match strings. 
      // For now, let's assume the frontend sends the index.
      if (q.type === "MCQ") {
        // Find if any option matches the correct answer
        const options = q.options; // Array of strings
        if (Array.isArray(options) && studentAnswer !== undefined) {
             const correctAnswerText = q.answer;
             if (options[studentAnswer] === correctAnswerText) {
               correctCount++;
             }
        }
      }
    });

    const score = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

    // 3. Save Attempt
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

    // 4. Update Student Readiness Score (Simplified: Add to profile)
    // In a real app, this would be a weighted update
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (profile) {
      const currentScore = profile.readinessScore || 0;
      const newReadiness = (currentScore + score) / 2; // Simple average for now
      await prisma.studentProfile.update({
        where: { userId },
        data: { readinessScore: newReadiness }
      });
    }

    return res.status(201).json({
      success: true,
      message: "Assessment submitted successfully",
      data: attempt
    });

  } catch (error) {
    console.error("Submit Attempt Error:", error);
    return res.status(500).json({ message: "Failed to submit assessment", error: error.message });
  }
};

export const getStudentAttempts = async (req, res) => {
  const userId = req.user.id;

  try {
    const attempts = await prisma.assessmentAttempt.findMany({
      where: { userId },
      include: {
        assessment: {
          select: { title: true, subject: true, type: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Compute real percentile for each attempt
    const attemptsWithPercentile = await Promise.all(
      attempts.map(async (a) => {
        // Count attempts on the same assessment with a LOWER score
        const below = await prisma.assessmentAttempt.count({
          where: {
            assessmentId: a.assessmentId,
            score: { lt: a.score },
          },
        });
        const total = await prisma.assessmentAttempt.count({
          where: { assessmentId: a.assessmentId },
        });
        const percentile = total > 1 ? Math.round((below / (total - 1)) * 100) : 100;

        return {
          ...a,
          percentile,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: attemptsWithPercentile,
    });

  } catch (error) {
    console.error("Fetch Attempts Error:", error);
    return res.status(500).json({ message: "Failed to fetch performance history", error: error.message });
  }
};

/**
 * GET /api/assessments/:assessmentId/attempts/all
 * Faculty: view all student submissions for a specific assessment for manual review.
 */
export const getAssessmentAttempts = async (req, res) => {
  const { assessmentId } = req.params;
  try {
    const attempts = await prisma.assessmentAttempt.findMany({
      where: { assessmentId },
      include: {
        user: { select: { id: true, name: true, email: true, usn: true } },
        assessment: { select: { title: true, questions: { select: { id: true, text: true, answer: true, options: true, type: true } } } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ success: true, data: attempts });
  } catch (error) {
    console.error("getAssessmentAttempts error:", error);
    return res.status(500).json({ message: "Failed to fetch attempts", error: error.message });
  }
};
