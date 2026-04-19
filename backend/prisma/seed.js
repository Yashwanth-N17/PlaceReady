import { prisma } from "../src/config/db.js";
import bcrypt from "bcryptjs";

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // --- FACULTY ACCOUNTS ---
  const faculties = [
    { email: "faculty1@placeready.com", name: "Dr. Smith" },
    { email: "faculty2@placeready.com", name: "Prof. Johnson" },
  ];

  for (const f of faculties) {
    await prisma.user.upsert({
      where: { email: f.email },
      update: { name: f.name, password },
      create: {
        email: f.email,
        name: f.name,
        password: password,
        role: "FACULTY",
      },
    });
  }

  // --- COMPANIES ---
  const companies = [
    { name: "Google", industry: "Technology", website: "https://google.com", description: "Global leader in search and AI." },
    { name: "Meta", industry: "Social Media", website: "https://meta.com", description: "Building the future of social connection." },
    { name: "Microsoft", industry: "Software", website: "https://microsoft.com", description: "Empowering every person and organization." },
    { name: "Amazon", industry: "E-commerce", website: "https://amazon.com", description: "Earth's most customer-centric company." },
  ];

  const dbCompanies = [];
  for (const c of companies) {
    const dbC = await prisma.company.upsert({
      where: { name: c.name },
      update: c,
      create: c,
    });
    dbCompanies.push(dbC);
  }

  // --- PLACEMENT DRIVES ---
  const drives = [
    { title: "Software Engineer - Graduate", role: "SDE-1", type: "FULL_TIME", status: "ACTIVE", salary: "18-24 LPA", companyId: dbCompanies[0].id, date: new Date("2026-06-15") },
    { title: "Frontend Developer", role: "Associate Developer", type: "FULL_TIME", status: "UPCOMING", salary: "12-15 LPA", companyId: dbCompanies[1].id, date: new Date("2026-07-20") },
    { title: "Data Science Intern", role: "Intern", type: "INTERNSHIP", status: "ACTIVE", salary: "50k/month", companyId: dbCompanies[2].id, date: new Date("2026-05-10") },
  ];

  for (const d of drives) {
    await prisma.placementDrive.create({
      data: d
    });
  }

  // --- STUDENT ACCOUNTS ---
  const students = [
    { email: "student1@placeready.com", name: "Alice Brown", usn: "1PR21CS001" },
    { email: "student2@placeready.com", name: "Bob Wilson", usn: "1PR21CS002" },
    { email: "student3@placeready.com", name: "Charlie Davis", usn: "1PR21CS003" },
  ];

  const facultyNodes = await prisma.user.findMany({ where: { role: "FACULTY" } });

  for (const s of students) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { name: s.name, usn: s.usn, password },
      create: {
        email: s.email,
        name: s.name,
        usn: s.usn,
        password: password,
        role: "STUDENT",
      },
    });

    // Student Profile
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: { readinessScore: 78, cgpa: 8.8 },
      create: {
        userId: user.id,
        id: user.id,
        branch: "Computer Science",
        semester: 6,
        readinessScore: 78,
        cgpa: 8.8
      }
    });

    // --- CREATE HISTORICAL ASSESSMENTS & ATTEMPTS ---
    const assessment = await prisma.assessment.create({
      data: {
        title: "DBMS & Operating Systems",
        type: "MOCK",
        subject: "Computer Science",
        scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        duration: 30,
        createdById: facultyNodes[0].id,
        students: { connect: { id: user.id } }
      }
    });

    await prisma.assessmentAttempt.create({
      data: {
        score: 85,
        correctCount: 17,
        totalCount: 20,
        timeTaken: 1200,
        focusLossCount: 0,
        userId: user.id,
        assessmentId: assessment.id,
        answers: { "q1": 0, "q2": 1 } // Simple mock response JSON
      }
    });

    const assessment2 = await prisma.assessment.create({
      data: {
        title: "Aptitude Drill 1",
        type: "PRACTICE",
        subject: "General",
        scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        duration: 15,
        createdById: facultyNodes[1].id,
        students: { connect: { id: user.id } }
      }
    });

    await prisma.assessmentAttempt.create({
      data: {
        score: 60,
        correctCount: 6,
        totalCount: 10,
        timeTaken: 800,
        focusLossCount: 2,
        userId: user.id,
        assessmentId: assessment2.id,
        answers: { "aq1": 2 }
      }
    });
  }

  console.log("✅ Comprehensive real-world seed data generated!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
