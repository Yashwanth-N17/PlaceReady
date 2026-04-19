import express from "express";
import {
  extractQuestions,
  saveQuestions,
  getQuestions,
} from "../controllers/question.controller.js";
import { upload } from "../middleware/upload.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/extract",
  authenticate,
  authorize("FACULTY", "PLACEMENT"),
  upload.single("file"),
  extractQuestions,
);

router.post(
  "/save",
  authenticate,
  authorize("FACULTY", "PLACEMENT"),
  saveQuestions,
);

router.get("/", authenticate, getQuestions);

export default router;
