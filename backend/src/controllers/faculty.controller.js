import { FacultyService } from "../services/faculty.service.js";
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

export const getMe = async (req, res) => {
  try {
    const faculty = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    return success(res, faculty);
  } catch (err) {
    return error(res, "Failed to load faculty info", 500, err);
  }
};

export const extractTestMetadata = async (req, res) => {
  return success(res, null, "Feature ready for AI integration");
};
