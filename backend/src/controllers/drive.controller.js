import { PlacementService } from "../services/placement.service.js";
import { prisma } from "../config/db.js";
import { success, error } from "../utils/response.js";

export const getDrives = async (req, res) => {
  try {
    const userId = req.user?.id;
    const data = await PlacementService.getAllDrives(userId);
    return success(res, data);
  } catch (err) {
    return error(res, "Failed to fetch drives", 500, err);
  }
};

export const createDrive = async (req, res) => {
  try {
    const { companyId, date, title, role, type, salary, location, description } = req.body;
    const drive = await prisma.placementDrive.create({
      data: { companyId, date: new Date(date), title: title || "Placement Drive", role, type, salary, location, description }
    });
    return success(res, drive, "Drive created successfully", 201);
  } catch (err) {
    return error(res, "Failed to create drive", 500, err);
  }
};

export const applyToDrive = async (req, res) => {
  try {
    await PlacementService.applyToDrive(req.user.id, req.params.id);
    return success(res, null, "Applied successfully");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const getDriveApplicants = async (req, res) => {
  try {
    const data = await PlacementService.getApplicants(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, "Failed to fetch applicants", 500, err);
  }
};

export const updateApplicantStatus = async (req, res) => {
  const { driveId, studentId } = req.params;
  const { status } = req.body;
  
  try {
    await prisma.studentProfile.updateMany({
      where: { userId: studentId },
      data: { placementStatus: status.toUpperCase() }
    });
    return success(res, null, `Status updated to ${status}`);
  } catch (err) {
    return error(res, "Failed to update status", 500, err);
  }
};
