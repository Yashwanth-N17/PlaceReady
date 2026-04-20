import express from "express";
import { createAssessment, getAssessments, getAssessmentById, getAssessmentQuestions, releaseResults } from "../controllers/assessment.controller.js";
import { submitAttempt, getStudentAttempts, getAssessmentAttempts, updateAttemptMarks } from "../controllers/assessmentAttempt.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, authorize("FACULTY", "PLACEMENT"), createAssessment);
router.post("/:id/release", authenticate, authorize("FACULTY"), releaseResults);
router.get("/", authenticate, getAssessments);
router.get("/attempts/pending", authenticate, authorize("FACULTY"), (req, res, next) => {
  // We'll add this to assessmentAttempt.controller.js
  import("../controllers/assessmentAttempt.controller.js").then(m => m.getPendingAttempts(req, res)).catch(next);
});
router.get("/attempts", authenticate, authorize("STUDENT"), getStudentAttempts);
router.get("/:id", authenticate, getAssessmentById);
router.get("/:id/questions", authenticate, getAssessmentQuestions);
router.post("/:assessmentId/submit", authenticate, authorize("STUDENT"), submitAttempt);

router.get("/:assessmentId/attempts/all", authenticate, authorize("FACULTY"), getAssessmentAttempts);
router.post("/attempts/:attemptId/grade", authenticate, authorize("FACULTY"), updateAttemptMarks);

export default router;
