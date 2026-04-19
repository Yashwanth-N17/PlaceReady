import axios from 'axios';

/**
 * AI Service for Placement Predictions
 */
export const AIService = {
  /**
   * Predicts a student's readiness score based on multiple metrics.
   * Uses Gemini-1.5-Flash or similar for high-speed analysis.
   */
  async predictReadiness(studentData) {
    const {
      scores,          // Array of test scores
      weakAreas,       // Array of subjects with low performance
      cgpa,
      focusLossCount,  // Proxy for discipline
      branch
    } = studentData;

    try {
      // If no API key is set, fallback to a smart weighted algorithm
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY not found. Using fallback weighted algorithm.");
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 60;
        const weightedScore = (avgScore * 0.6) + (cgpa * 10 * 0.3) - (focusLossCount * 2);
        return {
          score: Math.min(Math.max(weightedScore, 0), 100),
          feedback: "Readiness calculated via weighted metrics. Connect Gemini API for deep qualitative analysis."
        };
      }

      // Gemini API call (Example implementation)
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Analyze this engineering student's placement readiness:
              - Average Test Scores: ${scores.join(', ')}
              - Weak Areas: ${weakAreas.join(', ')}
              - CGPA: ${cgpa}
              - Focus Loss (Discipline): ${focusLossCount}
              - Branch: ${branch}
              
              Predict a readiness score (0-100) and provide a 1-sentence growth tip. 
              Output format: JSON { "score": number, "tip": "string" }`
            }]
          }]
        }
      );

      const resultText = response.data.candidates[0].content.parts[0].text;
      const result = JSON.parse(resultText.replace(/```json|```/g, ""));
      
      return {
        score: result.score,
        feedback: result.tip
      };
    } catch (error) {
      console.error("AI Prediction Error:", error);
      // Fail gracefully
      return { score: studentData.currentScore || 60, feedback: "Unable to reach AI service." };
    }
  }
};
