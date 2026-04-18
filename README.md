# 🎓 PlaceReady: Intelligent Placement Tracking System

PlaceReady is a centralized, real-time platform designed to manage, monitor, and enhance student placement readiness through structured training and AI-powered performance tracking.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (or any Prisma-supported DB)
- npm or yarn

### 2. Installation
Clone the repository and install dependencies for both frontend and backend.

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Database Setup
1. Create a `.env` file in the `backend` folder and add your `DATABASE_URL` and `JWT_SECRET`.
2. Run migrations and the seed script to populate initial users.

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Running the Dev Servers
```bash
# In backend folder
npm run dev

# In frontend folder
npm run dev
```

## 🔐 Credentials for Hackathon
| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | student@placeready.com | password123 |
| **Faculty** | faculty@placeready.com | password123 |
| **Placement** | placement@placeready.com | password123 |

## 🛠️ Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, Framer Motion, Recharts.
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL.
- **Security**: JWT (Access + Refresh Tokens), Bcrypt Hashing, Role-Based Access Control (RBAC).

## 📁 System Architecture
- **Auth**: Dual-token system with HTTP-only Refresh Token cookies and rotating Access Tokens.
- **API**: Functional Service-Controller pattern.
- **Frontend**: Protected Routes with role-based filtering.
