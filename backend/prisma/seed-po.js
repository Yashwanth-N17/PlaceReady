import { prisma } from '../src/config/db.js';

async function main() {
  console.log("Seeding companies...");
  
  await prisma.company.upsert({
    where: { name: 'Google' },
    update: {},
    create: {
      name: 'Google', role: 'SDE-1', ctc: '₹42 LPA', minCgpa: 8.5, minReadiness: 85,
      minApt: 80, minCode: 85, branches: ['CSE', 'ECE'], requiredSkills: ['DSA', 'System Design']
    }
  });

  await prisma.company.upsert({
    where: { name: 'Microsoft' },
    update: {},
    create: {
      name: 'Microsoft', role: 'SWE', ctc: '₹38 LPA', minCgpa: 8.0, minReadiness: 80,
      minApt: 75, minCode: 80, branches: ['CSE', 'ECE'], requiredSkills: ['DSA', 'OS']
    }
  });

  await prisma.company.upsert({
    where: { name: 'Amazon' },
    update: {},
    create: {
      name: 'Amazon', role: 'SDE', ctc: '₹32 LPA', minCgpa: 7.5, minReadiness: 75,
      minApt: 70, minCode: 75, branches: ['CSE', 'ECE'], requiredSkills: ['DSA', 'DBMS']
    }
  });

  await prisma.company.upsert({
    where: { name: 'Goldman Sachs' },
    update: {},
    create: {
      name: 'Goldman Sachs', role: 'Analyst', ctc: '₹28 LPA', minCgpa: 8.0, minReadiness: 78,
      minApt: 85, minCode: 65, branches: ['CSE', 'ECE', 'MECH'], requiredSkills: ['Aptitude', 'Quant']
    }
  });

  console.log("Seeding Placement Drives...");
  
  const google = await prisma.company.findUnique({ where: { name: 'Google' } });
  
  if (google) {
    await prisma.placementDrive.create({
      data: {
        title: 'Google SWE Full-time',
        companyId: google.id,
        date: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        location: 'Auditorium A',
        status: 'UPCOMING',
        role: 'SDE-1',
        salary: '₹42 LPA',
        type: 'FULL_TIME'
      }
    });
  }

  console.log("✅ Placement Officer Dashboard seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
