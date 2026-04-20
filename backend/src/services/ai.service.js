import axios from 'axios';
import FormData from 'form-data';

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const AIService = {
  /**
   * Proxies readiness prediction to the Python AI Service.
   */
  async predictReadiness(studentData) {
    try {
      const response = await axios.post(`${AI_URL}/predict-readiness`, studentData);
      return {
        score: response.data.score,
        feedback: response.data.tip || "Keep practicing your core skills."
      };
    } catch (error) {
      console.error("AI Bridge Prediction Error:", error.message);
      // Fallback to weighted algorithm if AI service is down
      const { scores, cgpa, focusLossCount } = studentData;
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 60;
      const weightedScore = (avgScore * 0.6) + (cgpa * 10 * 0.3) - (focusLossCount * 2);
      
      return {
        score: Math.min(Math.max(weightedScore, 0), 100),
        feedback: "Readiness estimate (Service Offline)."
      };
    }
  },

  /**
   * Proxies document extraction to the Python AI Service.
   */
  async extractQuestions(fileBuffer, filename) {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, { filename });

      const response = await axios.post(`${AI_URL}/extract-questions`, formData, {
        headers: formData.getHeaders(),
        timeout: 60000 // 60s for AI processing
      });

      if (!response.data.success) throw new Error("AI extraction failed");

      // Map Python model back to Node Question structure
      return response.data.questions.map(q => ({
        text: q.question_text || q.text,
        answer: q.answer,
        options: q.options,
        tags: q.tags,
        difficulty: q.difficulty || "Medium",
        type: q.type || "MCQ"
      }));
    } catch (err) {
      console.error("AI Bridge Extraction Error:", err.message);
      throw new Error("AI Service failed to parse document");
    }
  }
};
