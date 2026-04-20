# 🌐 PlaceReady Deployment Guide

This document outlines the professional deployment strategy for the three layers of the PlaceReady ecosystem.

---

## 1. Prerequisites for Production
*   **Database**: A hosted PostgreSQL instance (e.g., Supabase, Neon, AWS RDS).
*   **Gemini API**: Ensure your API key is configured with a payment method for production limits (or use the free tier if usage is light).
*   **Cloud Hosting**: Ensure you have accounts on Vercel (Frontend), Render/Railway/Heroku (Backend & AI Service).

---

## 2. Layer 1: Core Backend (Node.js/Express)
The backend manages auth, database orchestration, and business logic.

### Steps:
1.  **Environment Variables**: Set the following on your host:
    *   `PORT=5000`
    *   `DATABASE_URL`: Your PostgreSQL connection string.
    *   `JWT_SECRET`: A long, random string.
    *   `AI_SERVICE_URL`: The URL where your Layer 2 (AI Service) is hosted.
    *   `CLIENT_URL`: The URL where your Layer 3 (Frontend) is hosted.
2.  **Prisma Migration**: Run `npx prisma migrate deploy` in your CI/CD pipeline to apply schema changes to the production DB.
3.  **Start Command**: `npm run start` (Configure `package.json` to run `node src/index.js`).

---

## 3. Layer 2: AI Service (Python/FastAPI)
This service handles heavy lifting (Gemini, PDF parsing, Data extraction).

### Steps:
1.  **Infrastructure**: Recommend a provider with Python support (e.g., Render, Railway, or AWS Lambda).
2.  **Environment Variables**:
    *   `GEMINI_API_KEY`: Your key from Google AI Studio.
    *   `PORT=8000`
3.  **Start Command**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app` (For production-ready concurrency).

---

## 4. Layer 3: Frontend (React/Vite)
A static build served to the user's browser.

### Steps:
1.  **Build**: Run `npm run build` to generate the `dist` folder.
2.  **Environment Variables**: Ensure these are set **before** building:
    *   `VITE_API_URL`: The URL of your Layer 1 (Backend).
3.  **Hosting**: Deploy the `dist` folder to Vercel, Netlify, or AWS S3 + CloudFront.
4.  **Routing**: Enable "Single Page Application" (SPA) redirect to `index.html` on your host to avoid 404s on page refresh.

---

## 🚀 Deployment Checklist
1.  [ ] **Domain Setup**: Point your domain to the Frontend host.
2.  [ ] **SSL**: Ensure all three layers are served over `https`.
3.  [ ] **CORS**: Ensure your Backend lists the Frontend URL in its CORS configuration.
4.  [ ] **Scaling**: Monitor the AI Service memory usage when processing large PDFs (>50 pages).

---

### Recommended Hosting Stack (Low Cost/Scale):
*   **Frontend**: Vercel (Free tier)
*   **Backend**: Render / Railway ($5-7/mo)
*   **AI Service**: Railway ($5-7/mo)
*   **Database**: Supabase / Neon (Free Tier)
