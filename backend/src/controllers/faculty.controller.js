import { FacultyService } from "../services/faculty.service.js";
import { AIService } from "../services/ai.service.js";
import { prisma } from "../config/db.js";
import { success, error } from "../utils/response.js";

export const getStudents = async (req, res) => {
  try {
    const data = await FacultyService.getAllStudents();
    return success(res, data);
  } catch (err) {
    return error(res, "Failed to load students", 500, err);
  }
};

export const getStudentById = async (req, res) => {
  try {
    const data = await FacultyService.getStudentById(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 404);
  }
};

export const getDashStats = async (req, res) => {
  try {
    const data = await FacultyService.getDashStats();
    return success(res, data);
  } catch (err) {
    return error(res, "Failed to load dashboard statistics", 500, err);
  }
};

export const getBatchPerformance = async (req, res) => {
  try {
    const data = await FacultyService.getBatchPerformance();
    return success(res, data);
  } catch (err) {
    return error(res, "Failed to load batch performance", 500, err);
  }
};

export const getSkillGaps = async (req, res) => {
  try {
    const data = await FacultyService.getSkillGaps();
    return success(res, data);
  } catch (err) {
    return error(res, "Failed to load skill gaps", 500, err);
  }
};

export const getMe = async (req, res) => {
  try {
    const faculty = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { mentees: { select: { id: true } } }
    });

    if (!faculty) return error(res, "Faculty not found", 404);

    const result = {
      ...faculty,
      menteeIds: faculty.mentees.map(m => m.id)
    };
    delete result.mentees; // remove the nested objects

    return success(res, result);
  } catch (err) {
    return error(res, "Failed to load faculty info", 500, err);
  }
};

export const extractTestMetadata = async (req, res) => {
  try {
    if (!req.file) return error(res, "No file uploaded", 400);
    const questions = await AIService.extractQuestions(req.file.buffer, req.file.mimetype);
    return success(res, questions, "AI generated questions successfully");
  } catch (err) {
    return error(res, "AI Extraction failed: " + err.message, 500);
  }
};

export const uploadMarks = async (req, res) => {
  try {
    const { rows } = req.body;
    if (!rows || !Array.isArray(rows)) return error(res, "Invalid rows data", 400);
    
    const result = await FacultyService.bulkUploadMarks(rows, req.user.id);
    return success(res, result, "Marks updated successfully");
  } catch (err) {
    return error(res, "Failed to upload marks", 500, err);
  }
};
