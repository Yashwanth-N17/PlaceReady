import { QuestionService } from "../services/question.service.js";
import { success, error } from "../utils/response.js";
import fs from "fs";

export const extractQuestions = async (req, res) => {
  try {
    const questions = await QuestionService.extract(req.file);
    return success(res, questions, "Questions extracted successfully");
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return error(res, err.message, 400);
  }
};

export const saveQuestions = async (req, res) => {
  try {
    const result = await QuestionService.bulkSave(req.body.questions, req.user.id);
    return success(res, result, `${result.length} questions saved successfully`, 201);
  } catch (err) {
    return error(res, "Failed to save questions", 500, err);
  }
};

export const getQuestions = async (req, res) => {
  try {
    const questions = await QuestionService.list(req.query, req.user);
    return success(res, questions);
  } catch (err) {
    return error(res, "Failed to fetch questions", 500, err);
  }
};
