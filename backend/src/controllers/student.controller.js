import { StudentService } from "../services/student.service.js";
import { success, error } from "../utils/response.js";

export const getDashboardStats = async (req, res) => {
  try {
    const data = await StudentService.getDashboardStats(req.user.id);
    return success(res, data);
  } catch (err) {
    return error(res, "Failed to load dashboard stats", 500, err);
  }
};

export const refreshReadiness = async (req, res) => {
  try {
    const data = await StudentService.recalculateReadiness(req.user.id);
    return success(res, data, "Readiness score synchronized with latest AI prediction");
  } catch (err) {
    return error(res, "Failed to refresh readiness score", 500, err);
  }
};
