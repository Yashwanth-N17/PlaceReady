import express from "express";
import { createAssessment, getAssessments, getAssessmentById } from "../controllers/assessment.controller.js";
import { submitAttempt, getStudentAttempts, getAssessmentAttempts } from "../controllers/assessmentAttempt.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, authorize("FACULTY", "PLACEMENT"), createAssessment);
router.get("/", authenticate, getAssessments);
router.get("/attempts", authenticate, authorize("STUDENT"), getStudentAttempts);
router.get("/:id", authenticate, getAssessmentById);
router.post("/:assessmentId/submit", authenticate, authorize("STUDENT"), submitAttempt);

router.get("/:assessmentId/attempts/all", authenticate, authorize("FACULTY"), getAssessmentAttempts);

export default router;
