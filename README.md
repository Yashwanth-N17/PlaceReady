# 🚀 PlaceReady: AI-Powered Placement Mastery Ecosystem

PlaceReady is a high-performance, intelligent platform designed to bridge the gap between academic curriculum and corporate requirements. It leverages **Gemini 1.5 Pro/Flash** to provide real-time readiness analytics, behavioral tracking, and curriculum optimization.

---

## 🏗️ Triple-Engine Architecture

PlaceReady operates on a decentralized, multi-service architecture for maximum performance and AI scalability:

1.  **Frontend (React/Vite)**: Premium UI with Cinema-Mode exam environments and detailed student performance radar charts.
2.  **Core Backend (Node.js/Express)**: Handles business logic, RBAC security, and Prisma-based database orchestration.
3.  **AI Service (Python/FastAPI)**: A dedicated service for heavy AI processing, PDF/Excel text extraction, and Gemini-powered tag correlation.

---

## 🔥 Key Technical Features

### 1. High-Stakes Student Test Portal
*   **Cinema-Mode UI**: A distraction-free, full-screen environment for assessments.
*   **Behavioral Tracking**: Real-time detection of tab-switching and focus loss to calculate an "Integrity Score."
*   **Mastery Radar Charts**: Multi-dimensional results showing readiness across specific technical tags.

### 2. Faculty Big Data Lens
*   **Curriculum Gap Matrix**: Heatmaps showing real-time departmental failure rates by specific topic tags (e.g., Pointer Arithmetic).
*   **Readiness Lift AI**: Quantifies the potential improvement in the department's placement readiness if specific gaps are closed.
*   **Cleanup Triggers**: Instant scheduling of "Review Sessions" for high-failure topics with one click.

### 3. AI-Powered Test Extraction
*   **Multi-Format Logic**: Upload question papers in **PDF** or **Excel** formats.
*   **Gemini Engine**: Automatically extracts questions, maps technical tags, and identifies curriculum gaps during the scheduling phase.

---

## 🛠️ Setup Instructions

### 1. Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   PostgreSQL / MongoDB (Prisma Supported)
*   **Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/))

### 2. Service-Wise Installation

```bash
# 1. CORE BACKEND
cd backend
npm install
# Configure .env with DATABASE_URL, JWT_SECRET, and AI_SERVICE_URL=http://localhost:8000

# 2. FRONTEND
cd ../frontend
npm install

# 3. AI SERVICE (Python)
cd ../ai_service
pip install -r requirements.txt
# Configure .env with GEMINI_API_KEY=your_key_here
```

### 3. Running the Ecosystem
Open three terminal windows and run:
1.  **AI Service**: `cd ai_service && uvicorn main:app --port 8000`
2.  **Backend**: `cd backend && npm run dev`
3.  **Frontend**: `cd frontend && npm run dev`

---

## 🔐 Credentials for Testing
| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | [EMAIL_ADDRESS] | password123 |
| **Faculty** | [EMAIL_ADDRESS] | password123 |
| **Placement** | [EMAIL_ADDRESS] | password123 |

---

## 📡 API Documentation (Technical Reference)

### 1. Authentication
*   **`POST /api/auth/login`**
    *   **Body**: `{ "email": "...", "password": "...", "role": "STUDENT|FACULTY|PLACEMENT" }`
    *   **Response**: `200 OK` + HTTP-only Cookie (`refreshToken`) + JSON `{ "accessToken": "...", "user": {...} }`
*   **`GET /api/auth/me`** (Requires Token)
    *   **Description**: Returns the current session user data.
*   **`POST /api/auth/logout`**
    *   **Description**: Clears the authentication cookies.

### 2. AI & Faculty Operations
*   **`POST /api/faculty/extract-metadata`** (Requires Faculty Role)
    *   **Type**: `multipart/form-data`
    *   **Body**: `file` (PDF or Excel)
    *   **Response**: 
      ```json
      {
        "success": true,
        "data": {
          "subject": "...",
          "questions": [{ "question_text": "...", "tags": ["..."], "difficulty": "..." }],
          "suggested_curriculum_gaps": ["..."]
        }
      }
      ```

### 3. Student Operations
*   **`GET /api/student/quizzes`** (Requires Student Role)
    *   **Description**: Retrieves scheduled tests based on the student's department/batch.
*   **`POST /api/student/submit`** (Requires Student Role)
    *   **Body**: `{ "testId": "...", "answers": { "q1": 0, "q2": 3 } }`

---

## 🧬 Tech Stack
*   **Analytics**: Recharts, Framer Motion
*   **AI Stack**: Google Generative AI (Gemini), FastAPI, Pandas, PyPDF
*   **ORM**: Prisma (PostgreSQL/SQL)
*   **Frontend**: Tailwind CSS, Shadcn UI, Lucide Icons
