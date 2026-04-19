import express from "express";
import { extractTestMetadata, getMe, getStudents, getStudentById, getDashStats } from "../controllers/faculty.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/me", authenticate, authorize("FACULTY"), getMe);
router.get("/students", authenticate, authorize("FACULTY"), getStudents);
router.get("/students/:id", authenticate, authorize("FACULTY"), getStudentById);
router.get("/dash/batch-performance", authenticate, authorize("FACULTY"), getDashStats);
router.get("/dash/skill-gaps", authenticate, authorize("FACULTY"), getDashStats);

router.post(
  "/extract-metadata", 
  authenticate, 
  authorize("FACULTY"), 
  upload.single("file"), 
  extractTestMetadata
);

export default router;
