import { PlacementService } from "../services/placement.service.js";
import { success, error } from "../utils/response.js";

export const getCompanies = async (req, res) => {
  try {
    const data = await PlacementService.getCompanies();
    return success(res, data);
  } catch (err) {
    return error(res, "Failed to load companies", 500, err);
  }
};

export const createCompany = async (req, res) => {
  try {
    const data = await PlacementService.createCompany(req.body);
    return success(res, data, "Company added successfully", 201);
  } catch (err) {
    return error(res, "Failed to add company", 500, err);
  }
};
