import { prisma } from "../src/config/db.js";
import bcrypt from "bcryptjs";

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // Initial Student
  await prisma.user.upsert({
    where: { email: "student@placeready.com" },
    update: {},
    create: {
      email: "student@placeready.com",
      password: password,
      role: "STUDENT",
    },
  });

  // Initial Faculty
  await prisma.user.upsert({
    where: { email: "faculty@placeready.com" },
    update: {},
    create: {
      email: "faculty@placeready.com",
      password: password,
      role: "FACULTY",
    },
  });

  // Initial Placement Officer
  await prisma.user.upsert({
    where: { email: "placement@placeready.com" },
    update: {},
    create: {
      email: "placement@placeready.com",
      password: password,
      role: "PLACEMENT",
    },
  });

  console.log("✅ Seed data created successfully!");
  console.log("Credentials:");
  console.log("- Student: student@placeready.com / password123");
  console.log("- Faculty: faculty@placeready.com / password123");
  console.log("- Placement: placement@placeready.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
