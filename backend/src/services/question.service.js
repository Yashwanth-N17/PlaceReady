import { prisma } from "../config/db.js";
import { parseExcel, extractFromAI } from "./extraction.service.js";
import fs from "fs";
import path from "path";

export const QuestionService = {
  async extract(file) {
    if (!file) throw new Error("No file provided");
    const ext = path.extname(file.originalname).toLowerCase();
    
    let questions = [];
    if (ext === ".xlsx" || ext === ".xls" || ext === ".csv" || ext === ".pdf") {
      questions = await extractFromAI(file.path);
    } else {
      throw new Error("Unsupported file format. Please upload Excel or PDF.");
    }
    
    fs.unlink(file.path, () => {});
    return questions;
  },

  async bulkSave(questions, userId) {
    if (!questions || !Array.isArray(questions)) throw new Error("Invalid questions data");

    return await prisma.$transaction(async (tx) => {
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
            answer: String(q.answer || ""),
            options: q.options || null,
            type: q.type || "MCQ",
            subject: q.subject,
            topic: q.topic,
            difficulty: q.difficulty,
            uploadedBy: { connect: { id: userId } },
            tags: { connect: tagConnect }
          }
        });
        savedQuestions.push(savedQ);
      }
      return savedQuestions;
    });
  },

  async list(filters, user) {
    const { subject, topic, difficulty, tag } = filters;
    const where = {};
    if (subject) where.subject = subject;
    if (topic) where.topic = topic;
    if (difficulty) where.difficulty = difficulty;
    if (tag) where.tags = { some: { name: tag } };

    if (user.role !== "FACULTY" && user.role !== "PLACEMENT") {
      where.isVisible = true;
    }

    return await prisma.question.findMany({
      where,
      include: {
        tags: true,
        uploadedBy: { select: { name: true, fullName: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }
};
