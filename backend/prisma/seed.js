import { hashPassword } from '../src/utils/hash.js';
import { prisma } from '../src/config/db.js';

async function main() {
  console.log("🚀 Initializing HIGH-DENSITY 6-month data seeding...");

  // 1. Ensure Roles/Faculty
  const facultyPassword = await hashPassword('password123');
  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@placeready.edu' },
    update: {
      subjects: ["DSA", "Operating Systems", "Computer Networks", "DBMS"],
      department: "CSE",
    },
    create: {
      email: 'faculty@placeready.edu',
      password: facultyPassword,
      role: 'FACULTY',
      name: 'Dr. Katherine Miller',
      fullName: 'Katherine Miller',
      subjects: ["DSA", "Operating Systems", "Computer Networks", "DBMS"],
      department: "CSE",
    },
  });

  // 2. Create 10 Students with Profiles
  const branches = ["CSE", "ISE", "ECE", "EEE", "MECH"];
  const studentPassword = await hashPassword('password123');
  const studentUsers = [];

  for (let i = 1; i <= 10; i++) {
    const branch = branches[i % branches.length];
    const email = `student${i}@placeready.edu`;
    const usn = `1RV21${branch}${String(i).padStart(3, '0')}`;
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: studentPassword,
        role: 'STUDENT',
        name: `Student User ${i}`,
        fullName: `Student User ${i}`,
        usn,
        StudentProfile: {
          create: {
            id: usn,
            branch,
            cgpa: 7.0 + (Math.random() * 2.5),
            semester: 6,
            readinessScore: 50 + (Math.random() * 30),
            aiFeedback: "Continue practicing data structures to improve your readiness score."
          }
        }
      }
    });
    studentUsers.push(user);
  }

  console.log(`✅ Created/Synced 10 Students.`);
  
  // Assign first 5 students to faculty as mentees
  for (let i = 0; i < 5; i++) {
    await prisma.user.update({
      where: { id: studentUsers[i].id },
      data: { mentorId: faculty.id }
    });
  }
  console.log(`✅ Assigned 5 mentees to ${faculty.name}`);

  // 3. Create a Rich Question Bank
  const categories = [
    { name: "Aptitude", subjects: ["Quantitative", "Logical Reasoning", "Data Interpretation"] },
    { name: "Coding", subjects: ["Data Structures", "Algorithms", "Java Programming", "Python Development"] },
    { name: "Core", subjects: ["Database Mgmt", "Operating Systems", "Networking", "Computer Org"] },
    { name: "Soft Skills", subjects: ["Business Communication", "HR Interview Prep", "Verbal Ability"] }
  ];

  const questions = [];
  for (const cat of categories) {
    for (const sub of cat.subjects) {
        for (let k = 1; k <= 3; k++) {
            const q = await prisma.question.create({
                data: {
                    text: `Sample ${sub} Question ${k}?`,
                    answer: "A",
                    options: ["A", "B", "C", "D"],
                    type: cat.name === "Coding" && k === 3 ? "CODING" : "MCQ",
                    subject: sub,
                    topic: `${sub} Fundamentals`,
                    difficulty: k === 1 ? "Easy" : k === 2 ? "Medium" : "Hard",
                    uploadedById: faculty.id,
                    isVisible: true
                }
            });
            questions.push(q);
        }
    }
  }
  console.log(`✅ Generated ${questions.length} Questions for the library.`);

  // 4. Create Assessments Spread Over 6 Months
  // 3 tests per month for 6 months = 18 tests
  const now = new Date();
  const assessments = [];
  
  for (let m = 5; m >= 0; m--) { // Last 6 months
    for (let t = 1; t <= 3; t++) { // 3 tests per month
        const date = new Date(now);
        date.setMonth(now.getMonth() - m);
        date.setDate(t * 7); // Spread across month (7th, 14th, 21st)
        
        const cat = categories[(m + t) % categories.length];
        const sub = cat.subjects[t % cat.subjects.length];

        const assessment = await prisma.assessment.create({
            data: {
                title: `${sub} - ${m === 0 ? 'Current' : m + ' Months Ago'} Challenge`,
                type: cat.name.toUpperCase(),
                subject: sub,
                scheduledAt: date,
                duration: 45,
                createdById: faculty.id,
                questions: {
                    connect: questions.filter(q => q.subject === sub).map(q => ({ id: q.id }))
                }
            }
        });
        assessments.push(assessment);
    }
  }
  console.log(`✅ Created ${assessments.length} Historical Assessments.`);

  // 5. Generate Dense Attempts (Simulate growth)
  let totalAttempts = 0;
  for (const student of studentUsers) {
    for (let i = 0; i < assessments.length; i++) {
        const ass = assessments[i];
        
        // Students take about 80% of tests
        if (Math.random() > 0.8) continue;

        // Simulate score progression: 
        // month 5 ago -> base 40
        // month 0 ago -> base 75
        const monthIndex = 5 - Math.floor(i / 3); // 0 to 5 (0 is oldest)
        const base = 40 + (monthIndex * 8); // 40, 48, 56, 64, 72, 80
        const randomFactor = Math.random() * 20;
        const score = Math.min(100, Math.round(base + randomFactor));

        await prisma.assessmentAttempt.create({
            data: {
                score,
                correctCount: Math.round(score/10),
                totalCount: 10,
                timeTaken: 15 * 60, 
                focusLossCount: Math.floor(Math.random() * 4),
                answers: { "seed": true },
                userId: student.id,
                assessmentId: ass.id,
                createdAt: new Date(ass.scheduledAt.getTime() + (2 * 3600000)) // 2 hours later
            }
        });
        totalAttempts++;
    }
  }

  console.log(`✅ Generated ${totalAttempts} Attempts across the last 6 months.`);
  console.log("✨ DENSE SEEDING COMPLETE. Charts will now look spectacular!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
