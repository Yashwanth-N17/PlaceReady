import { AssessmentService } from "../services/assessment.service.js";
import { prisma } from "../config/db.js";
import { success, error } from "../utils/response.js";

export const getAssessments = async (req, res) => {
  try {
    const data = await AssessmentService.getAll();
    return success(res, data);
  } catch (err) {
    return error(res, "Failed to load assessments", 500, err);
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

export const createAssessment = async (req, res) => {
  const { title, subject, topic, type, duration, totalMarks, questionIds } = req.body;
  
  try {
    const assessment = await prisma.assessment.create({
      data: {
        title,
        subject,
        topic,
        type: type || "MCQ",
        duration: parseInt(duration) || 60,
        totalMarks: parseInt(totalMarks) || 100,
        questions: {
          connect: questionIds.map(id => ({ id }))
        }
      }
    });
    return success(res, assessment, "Assessment created successfully", 201);
  } catch (err) {
    return error(res, "Failed to create assessment", 500, err);
  }
};
