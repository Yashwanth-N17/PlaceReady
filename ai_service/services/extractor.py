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

class AssessmentExtraction(BaseModel):
    subject: Optional[str] = "Technical Assessment"
    topic: Optional[str] = ""
    total_questions: Optional[int] = 0
    questions: Optional[List[QuestionInfo]] = []
    overall_difficulty: Optional[str] = "Medium"
    suggested_curriculum_gaps: Optional[List[str]] = []

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

extractor_service = GapsExtractor()
