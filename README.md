# 🚀 PlaceReady: AI-Powered Placement Mastery Ecosystem

PlaceReady is a high-performance, intelligent platform designed to bridge the gap between academic curriculum and corporate requirements. It leverages **Gemini 1.5 Pro/Flash** to provide real-time readiness analytics, behavioral tracking, and adaptive learning paths.

---

## 🏗️ Triple-Engine Architecture

PlaceReady operates on a decentralized, multi-service architecture for maximum performance and AI scalability:

1.  **Frontend (React/Vite/TS)**: Premium UI with Cinema-Mode exam environments, adaptive dashboards, and detailed recruitment analytics.
2.  **Core Backend (Node.js/Express)**: Handles business logic, RBAC security, eligibility enforcement, and Prisma-based database orchestration.
3.  **AI Service (Python/FastAPI)**: A dedicated service for heavy AI processing, PDF/Excel text extraction, and Gemini-powered readiness prediction.

---

## 🔥 Key Technical Features

### 1. Adaptive Practice Engine (`Adaptive-AI`)
*   **Dynamic Scaling**: Questions automatically adjust difficulty (EASY → MEDIUM → HARD) in real-time based on the student's last 3 responses.
*   **Targeted Remediation**: Highlights "Target Difficulty" questions with visual glow effects to guide students toward mastery.

### 2. Behavioral Benchmarking (`Proctor-AI`)
*   **Cinema-Mode Environments**: Distraction-free assessment zones with strict proctoring.
*   **Discipline Scoring**: Real-time tracking of tab-switching and focus loss, converted into a **Professional Discipline Score** visible to recruiters.
*   **Benchmarking Radar**: Visual compare of technical readiness vs. behavioral integrity.

### 3. Smart Shortlisting & Eligibility 
*   **Strict Gating**: Drive applications are programmatically locked if students don't meet company-specific **CGPA** or **AI-Readiness** cutoffs.
*   **Benchmarking Matrix**: Placement officers can filter the pool using academic, technical, and behavioral "Discipline" filters simultaneously.

### 4. Advanced Insights & Trends
*   **Historical Trends**: Decoupled time-series analytics showing monthly readiness growth and Year-over-Year (YoY) placement success.
*   **Segmented Reports**: Interactive branch comparisons (Radar/Bar) and Company Tier breakdowns (Product vs Service conversion).

### 5. AI Sanity Checker
*   **Extraction Validation**: automatically flags 8 types of issues (missing text, ambiguous answers, MCQ validity) during PDF question extraction to ensure 100% data integrity.

---

## 🛠️ Setup Instructions

### 1. Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   PostgreSQL (Prisma Supported)
*   **Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/))

### 2. Service-Wise Installation

```bash
# 1. CORE BACKEND
cd backend
npm install
# Configure .env with DATABASE_URL, JWT_SECRET, and AI_SERVICE_URL

# 2. FRONTEND
cd ../frontend
npm install
# Set VITE_API_URL in .env

# 3. AI SERVICE (Python)
cd ../ai_service
pip install -r requirements.txt
# Configure .env with GEMINI_API_KEY
```

### 3. Running the Ecosystem
Open three terminal windows and run:
1.  **AI Service**: `cd ai_service && uvicorn main:app --port 8000`
2.  **Backend**: `cd backend && npm run dev`
3.  **Frontend**: `cd frontend && npm run dev`

---

## 🏎️ Tech Stack
*   **UX/UI**: Framer Motion, Recharts, Shadcn UI, Tailwind CSS
*   **Core**: React 18, TypeScript, Vite
*   **Intelligence**: Google Gemini-1.5, FastAPI, PyPDF
*   **Infrastructure**: Prisma ORM, Node.js, Express, PostgreSQL
