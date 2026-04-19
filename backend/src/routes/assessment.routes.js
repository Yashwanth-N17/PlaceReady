import express from "express";
import { createAssessment, getAssessments } from "../controllers/assessment.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("FACULTY", "PLACEMENT"),
  createAssessment
);

router.get(
  "/",
  authenticate,
  getAssessments
);

export default router;
