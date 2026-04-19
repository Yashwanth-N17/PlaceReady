import xlsx from "xlsx";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";

export const parseExcel = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    return data.map(row => {
      let options = null;
      if (row.options) {
        options = typeof row.options === "string" ? row.options.split(",").map(s => s.trim()) : row.options;
      } else if (row.A || row.B || row.C || row.D) {
        options = [row.A, row.B, row.C, row.D].filter(Boolean);
      }

      return {
        text: row.text || row.Question || row.question,
        answer: String(row.answer || row.Answer || row.correctAnswer || ""),
        options: options,
        type: row.type || row.Type || (options ? "MCQ" : "SUBJECTIVE"),
        subject: row.subject || row.Subject,
        topic: row.topic || row.Topic,
        difficulty: row.difficulty || row.Difficulty || "MEDIUM"
      };
    }).filter(q => q.text && q.answer); 
  } catch (error) {
    throw new Error(`Excel parsing failed: ${error.message}`);
  }
};

export const extractFromAI = async (filePath) => {
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
  
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), {
      filename: path.basename(filePath)
    });

    const response = await axios.post(`${AI_SERVICE_URL}/extract-questions`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 300000 
    });

    const { questions, subject, topic } = response.data;

    return (questions || []).map(q => ({
      text: q.question_text || q.text,
      answer: q.answer,
      options: q.options,
      tags: q.tags,
      difficulty: q.difficulty?.toUpperCase() || "MEDIUM",
      type: q.type || (q.options?.length > 0 ? "MCQ" : "SUBJECTIVE"),
      subject: q.subject || subject,
      topic: q.topic || topic
    }));
  } catch (error) {
    console.error("AI Service Error:", error.response?.data || error.message);
    throw new Error(`AI extraction failed: ${error.message}`);
  }
};
