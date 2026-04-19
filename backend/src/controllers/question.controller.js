import { parseExcel, extractFromAI } from "../services/extraction.service.js";
import { prisma } from "../config/db.js";
import fs from "fs";
import path from "path";

export const extractQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let questions = [];

    if (ext === ".xlsx" || ext === ".xls" || ext === ".csv" || ext === ".pdf") {
      questions = await extractFromAI(req.file.path);
    } else {
      return res.status(400).json({ message: "Unsupported file format. Please upload Excel or PDF." });
    }

    fs.unlink(req.file.path, () => {});

    return res.status(200).json({
      success: true,
      message: "Questions extracted successfully",
      data: questions
    });

  } catch (error) {
    console.error("Extraction Error:", error);
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ message: "Failed to extract questions", error: error.message });
  }
};

export const saveQuestions = async (req, res) => {
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: "No questions provided to save" });
  }

  try {
    const uploadedById = req.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const savedQuestions = [];

      for (const q of questions) {
        let tagConnect = [];
        if (q.tags && Array.isArray(q.tags)) {
          for (const tagName of q.tags) {
            const tag = await tx.tag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            });
            tagConnect.push({ id: tag.id });
          }
        }

        const savedQ = await tx.question.create({
          data: {
            text: q.text,
            answer: q.answer || "", // Ensure answer is not null
            options: q.options || null,
            type: q.type || "MCQ",
            subject: q.subject,
            topic: q.topic,
            difficulty: q.difficulty,
            uploadedBy: {
              connect: { id: uploadedById }
            },
            tags: {
              connect: tagConnect
            }
          }
        });
        savedQuestions.push(savedQ);
      }
      return savedQuestions;
    });

    return res.status(201).json({
      success: true,
      message: `${result.length} questions saved successfully`,
      data: result
    });

  } catch (error) {
    console.error("Save Error:", error);
    return res.status(500).json({ message: "Failed to save questions", error: error.message });
  }
};

export const getQuestions = async (req, res) => {
  const { subject, topic, difficulty, tag } = req.query;

  try {
    const where = {};
    if (subject) where.subject = subject;
    if (topic) where.topic = topic;
    if (difficulty) where.difficulty = difficulty;
    if (tag) {
      where.tags = {
        some: { name: tag }
      };
    }

    if (req.user.role !== "FACULTY" && req.user.role !== "PLACEMENT") {
      where.isVisible = true;
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        tags: true,
        uploadedBy: {
          select: { name: true, fullName: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({
      success: true,
      data: questions
    });

  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ message: "Failed to fetch questions", error: error.message });
  }
};
