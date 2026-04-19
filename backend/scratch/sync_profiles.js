import { prisma } from "../src/config/db.js";

async function main() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { StudentProfile: true }
  });

  const branches = ["Computer Science", "Information Science", "Electronics", "Mechanical"];
  
  console.log(`Checking ${students.length} students...`);

  for (const s of students) {
    if (!s.StudentProfile) {
      console.log(`Creating profile for ${s.email}...`);
      await prisma.studentProfile.create({
        data: {
          id: s.id,
          userId: s.id,
          branch: branches[Math.floor(Math.random() * branches.length)],
          semester: 6,
          readinessScore: Math.floor(Math.random() * 40) + 40, // 40-80
          cgpa: parseFloat((Math.random() * (9.5 - 7.0) + 7.0).toFixed(2)), // 7.0-9.5
        }
      });
    }
  }
  console.log("✅ All student profiles synchronized.");
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
