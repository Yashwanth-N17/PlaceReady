import { prisma } from "../src/config/db.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting Deep Database Reset & Comprehensive Seeding...");

  // 1. Clean Database in Reverse Topological Order
  console.log("🧹 Clearing existing data...");
  await prisma.notification.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.question.deleteMany();
  await prisma.tag.deleteMany();
  
  const placementDrives = await prisma.placementDrive.findMany();
  for (const p of placementDrives) {
    await prisma.placementDrive.update({
      where: { id: p.id },
      data: { students: { set: [] } } 
    });
  }
  await prisma.placementDrive.deleteMany();
  await prisma.company.deleteMany();
  
  await prisma.studentProfile.deleteMany();
  const users = await prisma.user.findMany();
  for (const u of users) {
    try {
      await prisma.user.update({
        where: { id: u.id },
        data: { mentees: { set: [] }, mentor: { disconnect: true } }
      });
    } catch(e) {}
  }
  await prisma.user.deleteMany();

  // 2. Base Metadata
  const defaultPassword = await bcrypt.hash("password123", 10);
  
  console.log("👨‍🏫 Creating Faculty and Placement users...");
  const faculty = await prisma.user.create({
    data: {
      email: "faculty@placeready.com",
      password: defaultPassword,
      role: "FACULTY",
      fullName: "Dr. Alan Turing",
      name: "Alan",
      department: "Computer Science",
    }
  });

  const placement = await prisma.user.create({
    data: {
      email: "placement@placeready.com",
      password: defaultPassword,
      role: "PLACEMENT",
      fullName: "Sheryl Sandberg",
      name: "Sheryl",
      department: "Placement Cell",
    }
  });

  console.log("🏷️ Creating Tags and Questions...");
  const tagsData = ["Algorithms", "Data Structures", "Aptitude", "System Design", "Core CS", "Soft Skills"];
  const createdTags = [];
  for (const t of tagsData) {
    createdTags.push(await prisma.tag.create({ data: { name: t } }));
  }

  const q1 = await prisma.question.create({
    data: {
      text: "What is the time complexity of QuickSort in the worst case?",
      answer: "O(n^2)",
      options: ["O(n log n)", "O(n)", "O(n^2)", "O(1)"],
      type: "MCQ",
      subject: "Data Structures",
      topic: "Sorting",
      difficulty: "MEDIUM",
      isVisible: true,
      uploadedById: faculty.id,
      tags: { connect: [{ id: createdTags[0].id }] }
    }
  });

  const q2 = await prisma.question.create({
    data: {
      text: "If 5 machines make 5 widgets in 5 minutes, how long does it take 100 machines to make 100 widgets?",
      answer: "5 minutes",
      options: ["100 minutes", "5 minutes", "20 minutes", "10 minutes"],
      type: "MCQ",
      subject: "Aptitude",
      topic: "Time & Work",
      difficulty: "HARD",
      isVisible: true,
      uploadedById: faculty.id,
      tags: { connect: [{ id: createdTags[2].id }] }
    }
  });

  const q3 = await prisma.question.create({
    data: {
      text: "Explain the CAP theorem in distributed systems.",
      answer: "Consistency, Availability, Partition Tolerance",
      type: "DESCRIPTIVE",
      subject: "System Design",
      topic: "Arch",
      difficulty: "HARD",
      isVisible: true,
      uploadedById: faculty.id,
      tags: { connect: [{ id: createdTags[3].id }] }
    }
  });

  console.log("🎓 Creating Students with Profiles...");
  const studentData = [
    { name: "Alice Johnson", usn: "1CR20CS001", cgpa: 9.2, readiness: 88, status: "OFFERED", email: "alice@placeready.com" },
    { name: "Bob Smith", usn: "1CR20CS002", cgpa: 7.5, readiness: 62, status: "SHORTLISTED", email: "bob@placeready.com" },
    { name: "Charlie Davis", usn: "1CR20CS003", cgpa: 8.1, readiness: 75, status: "APPLIED", email: "charlie@placeready.com" },
    { name: "David Miller", usn: "1CR20CS004", cgpa: 6.8, readiness: 55, status: "UNPLACED", email: "david@placeready.com" },
    { name: "Eve Wilson", usn: "1CR20CS005", cgpa: 8.9, readiness: 92, status: "PLACED", email: "eve@placeready.com" },
  ];

  const students = [];
  for (const s of studentData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        password: defaultPassword,
        role: "STUDENT",
        fullName: s.name,
        name: s.name.split(" ")[0],
        usn: s.usn,
        department: "Computer Science",
        mentorId: faculty.id,
      }
    });

    await prisma.studentProfile.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        cgpa: s.cgpa,
        readinessScore: s.readiness,
        aptitudeScore: s.readiness * 0.9,
        codingScore: s.readiness * 1.1,
        coreScore: s.readiness,
        softSkillsScore: s.readiness * 0.95,
        semester: 7,
        branch: "Computer Science",
        placementStatus: s.status,
      }
    });
    students.push(user);
  }

  // --- Historic Drills (Last 6 Months) ---
  console.log("📈 Generating 6 Months of Historic Analytics...");
  const now = new Date();
  
  for (let i = 6; i >= 1; i--) {
    const pastDate = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
    
    // Create an apti test explicitly for month trend visualization
    const assessment = await prisma.assessment.create({
      data: {
        title: `Monthly Readiness Drill - Month ${7-i}`,
        description: `Month ${7-i} tracking assessment.`,
        type: "MOCK",
        scheduledAt: pastDate,
        duration: 60,
        createdAt: pastDate,
        updatedAt: pastDate,
        createdById: faculty.id,
        resultsReleased: true,
        students: { connect: students.map(s => ({ id: s.id })) },
        questions: { connect: [{ id: q1.id }, { id: q2.id }] }
      }
    });

    for (let j = 0; j < students.length; j++) {
      const studentInfo = studentData[j];
      const startReadiness = studentInfo.readiness - 30; 
      const incrementPerMonth = 30 / 6;
      let monthScore = startReadiness + (7-i) * incrementPerMonth;
      monthScore = monthScore + (Math.random() * 8 - 4);
      monthScore = Math.max(0, Math.min(100, monthScore));

      const isHighFocusLoss = Math.random() > 0.8;
      
      await prisma.assessmentAttempt.create({
        data: {
          score: monthScore,
          correctCount: Math.round((monthScore / 100) * 10),
          totalCount: 10,
          timeTaken: 1200 + Math.floor(Math.random() * 600),
          focusLossCount: isHighFocusLoss ? Math.floor(Math.random() * 10) + 5 : Math.floor(Math.random() * 3),
          answers: { [q1.id]: 1, [q2.id]: 3 },
          userId: students[j].id,
          assessmentId: assessment.id,
          createdAt: new Date(pastDate.getTime() + 24 * 60 * 60 * 1000) 
        }
      });
    }
  }

  // --- RECENT UNRELEASED ASSESSMENT (For Faculty Manual Review / Grading Dashboard) ---
  console.log("📝 Creating Unreleased Mock for Faculty Review...");
  const recentPastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  const unreleasedMock = await prisma.assessment.create({
    data: {
      title: "Core CS Mid-Term Evaluation",
      description: "Subjective test requiring manual evaluation of descriptive answers.",
      type: "SUBJECT",
      scheduledAt: recentPastDate,
      duration: 90,
      resultsReleased: false, // CRITICAL for Faculty Manual Review dashboard
      createdById: faculty.id,
      students: { connect: students.map(s => ({ id: s.id })) },
      questions: { connect: [{ id: q3.id }] }
    }
  });

  // They all attempted it
  for (let j = 0; j < students.length; j++) {
    await prisma.assessmentAttempt.create({
      data: {
        score: 0, // Not graded yet
        correctCount: 0,
        totalCount: 1,
        timeTaken: 2400,
        focusLossCount: Math.floor(Math.random() * 5),
        answers: { [q3.id]: "The CAP theorem states that a distributed data store..." },
        userId: students[j].id,
        assessmentId: unreleasedMock.id,
        createdAt: new Date(recentPastDate.getTime() + 3600 * 1000) 
      }
    });
  }

  // --- UPCOMING ASSESSMENT ---
  const upcomingDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
  await prisma.assessment.create({
    data: {
      title: `Final Placements Qualifier - Coding Round`,
      description: `Mandatory test for Tier-1 product companies.`,
      type: "CODING",
      scheduledAt: upcomingDate,
      duration: 120,
      resultsReleased: false,
      createdById: faculty.id,
      students: { connect: students.map(s => ({ id: s.id })) },
      questions: { connect: [{ id: q1.id }] }
    }
  });

  // --- Create Companies and Drives ---
  console.log("🏢 Creating Companies & Placement Drives...");
  const google = await prisma.company.create({
    data: { name: "Google India", industry: "Product", ctc: "32 LPA", minCgpa: 8.5, minReadiness: 85, website: "careers.google.com" }
  });

  const amazon = await prisma.company.create({
    data: { name: "Amazon", industry: "Product", ctc: "44 LPA", minCgpa: 8.0, minReadiness: 80, website: "amazon.jobs" }
  });

  const infosys = await prisma.company.create({
    data: { name: "Infosys", industry: "Service", ctc: "5.5 LPA", minCgpa: 6.0, minReadiness: 50, website: "infosys.com/careers" }
  });

  // Upcoming Drive
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await prisma.placementDrive.create({
    data: {
      title: "Google SDE Intern On-Campus",
      description: "Hiring for Summer 2027 SDE Role",
      date: nextWeek,
      role: "Software Development Engineer",
      type: "INTERNSHIP",
      status: "ACTIVE",
      salary: "1.2 LPM Stipend",
      companyId: google.id,
      students: { connect: [{ id: students[0].id }] } // Alice applied
    }
  });

  // Past Info (Completed Drives)
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  await prisma.placementDrive.create({
    data: {
      title: "Amazon SDE-1",
      description: "Full-Time Hiring for Bangalore office.",
      date: lastMonth,
      role: "SDE-1",
      type: "FULL_TIME",
      status: "COMPLETED",
      salary: "44 LPA",
      companyId: amazon.id,
      // Alice & Eve applied
      students: { connect: [{ id: students[0].id }, { id: students[4].id }] } 
    }
  });

  // Upcoming non-active drive
  await prisma.placementDrive.create({
    data: {
      title: "Infosys System Engineer",
      description: "Mass hiring across branches.",
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      role: "System Engineer",
      type: "FULL_TIME",
      status: "UPCOMING",
      salary: "5.5 LPA",
      companyId: infosys.id,
      students: { connect: [{ id: students[1].id }, { id: students[2].id }] }
    }
  });

  // Add some notifications so the bell icon shows something
  await prisma.notification.createMany({
    data: [
      { userId: students[0].id, title: "Mock Test Scheduled", message: "Final Placements Qualifier scheduled for 3 days from now.", type: "INFO" },
      { userId: faculty.id, title: "Submissions Pending Review", message: "5 students have completed the Core CS Mid-Term Evaluation.", type: "WARNING" }
    ]
  });

  console.log("✅ Database Reset and Seeding Completed Successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
