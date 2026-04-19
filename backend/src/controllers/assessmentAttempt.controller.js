import { AssessmentService } from "../services/assessment.service.js";
import { prisma } from "../config/db.js";
import { success, error } from "../utils/response.js";

export const submitAttempt = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const attempt = await AssessmentService.processSubmission(req.user.id, assessmentId, req.body);
    return success(res, attempt, "Assessment submitted successfully", 201);
  } catch (err) {
    return error(res, "Failed to submit assessment", 500, err);
  }
};

export const getStudentAttempts = async (req, res) => {
  try {
    const history = await AssessmentService.getStudentHistory(req.user.id);
    return success(res, history);
  } catch (err) {
    return error(res, "Failed to fetch performance history", 500, err);
  }
};

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
    return success(res, attempts);
  } catch (err) {
    return error(res, "Failed to fetch attempts", 500, err);
  }
};
