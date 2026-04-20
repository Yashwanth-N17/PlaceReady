import { AssessmentService } from "../services/assessment.service.js";
import { prisma } from "../config/db.js";
import { success, error } from "../utils/response.js";

export const getAssessments = async (req, res) => {
  try {
    const userId = req.user.role === "STUDENT" ? req.user.id : null;
    const data = await AssessmentService.getAll(userId);
    return success(res, data);
  } catch (err) {
    return error(res, "Failed to load assessments", 500, err);
  }
};

export const releaseResults = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await AssessmentService.releaseResults(id);
    return success(res, assessment, "Assessment results released to students");
  } catch (err) {
    return error(res, "Failed to release results", 500, err);
  }
};

export const getAssessmentById = async (req, res) => {
  try {
    const data = await AssessmentService.getById(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 404);
  }
};

export const getAssessmentQuestions = async (req, res) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
      include: { questions: true }
    });
    
    if (!assessment) return error(res, "Assessment not found", 404);

    const mappedQuestions = assessment.questions.map(q => ({
      id: q.id,
      question: q.text,
      options: Array.isArray(q.options) ? q.options : [],
      correctIndex: Array.isArray(q.options) 
        ? q.options.findIndex(opt => opt === q.answer || opt.includes(q.answer))
        : -1,
      explanation: "Refer to course material for more details.",
      topic: q.topic || assessment.subject
    }));

    return success(res, mappedQuestions);
  } catch (err) {
    return error(res, "Failed to load questions", 500, err);
  }
};

export const createAssessment = async (req, res) => {
  try {
    const assessment = await AssessmentService.create(req.body, req.user.id);
    return success(res, assessment, "Assessment created and scheduled successfully", 201);
  } catch (err) {
    return error(res, "Failed to create assessment", 500, err);
  }
};
