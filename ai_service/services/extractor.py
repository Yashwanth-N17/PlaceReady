import os
from google import genai
from typing import List, Optional
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import json

load_dotenv()

class QuestionInfo(BaseModel):
    question_text: Optional[str] = ""
    answer: Optional[str] = ""
    options: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    difficulty: Optional[str] = "Medium"
    type: Optional[str] = "MCQ"

    suggested_curriculum_gaps: Optional[List[str]] = []

class ReadinessAnalysis(BaseModel):
    score: float = Field(..., ge=0, le=100)
    tip: str = Field(..., description="A short, actionable growth tip")
    weak_areas: List[str] = []

class AssessmentExtraction(BaseModel):
    subject: str = Field(..., description="The main subject of the assessment")
    topic: str = Field(..., description="The specific topic or chapter")
    questions: List[QuestionInfo] = []

class GapsExtractor:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        # Using the exact string found in the discovery list
        self.model_id = "gemini-flash-latest"

    async def extract_tags_from_text(self, text: str) -> AssessmentExtraction:
        prompt = f"""
        Analyze this assessment text and return a structured JSON response.
        Identify the subject, questions, tags, and difficulty.
        
        DATA:
        {text}
        """
        
        try:
            print(f"CALLING AI ENGINE: {self.model_id}...")
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': AssessmentExtraction,
                }
            )
            
            raw_text = response.text
            print(f"AI RESPONSE RECEIVED: {raw_text[:100]}...")
            
            # Use safe parsing to handle any Pydantic V2/V1 differences
            data = json.loads(raw_text)
            return AssessmentExtraction.model_validate(data)
            
        except Exception as e:
            print(f"!!! AI ENGINE ERROR !!!: {e}")
            raise e

    async def analyze_readiness(self, data: dict) -> ReadinessAnalysis:
        prompt = f"""
        Analyze this engineering student's placement readiness:
        - Average Test Scores: {data.get('scores', [])}
        - Weak Areas: {data.get('weakAreas', [])}
        - CGPA: {data.get('cgpa', 0)}
        - Focus Loss (Discipline): {data.get('focusLossCount', 0)}
        - Branch: {data.get('branch', 'General')}
        
        Predict a readiness score (0-100) and provide a 1-sentence growth tip.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': ReadinessAnalysis,
                }
            )
            return ReadinessAnalysis.model_validate_json(response.text)
        except Exception as e:
            print(f"Readiness Analysis Error: {e}")
            raise e

extractor_service = GapsExtractor()
