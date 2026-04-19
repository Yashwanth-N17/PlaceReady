import { prisma } from "../config/db.js";

export const PlacementService = {
  async getCompanies() {
    return await prisma.company.findMany({ include: { drives: true } });
  },

  async createCompany(data) {
    return await prisma.company.create({ data });
  },

  async createDrive(data) {
     return await prisma.placementDrive.create({
      data: { 
        ...data,
        date: new Date(data.date),
        title: data.title || "Placement Drive" 
      }
    });
  },

  async getAllDrives(userId) {
    const drives = await prisma.placementDrive.findMany({
      include: {
        company: true,
        students: { include: { StudentProfile: { select: { placementStatus: true } } } }
      },
      orderBy: { createdAt: "desc" }
    });

    return drives.map(d => ({
      ...d,
      applicantCount: d.students.length,
      offersCount: d.students.filter(s => s.StudentProfile?.placementStatus === "OFFERED").length,
      hasApplied: userId ? d.students.some(s => s.id === userId) : false,
    }));
  },

  async applyToDrive(userId, driveId) {
    const existing = await prisma.placementDrive.findFirst({
      where: { id: driveId, students: { some: { id: userId } } }
    });
    if (existing) throw new Error("Already applied to this drive");

    await prisma.placementDrive.update({
      where: { id: driveId },
      data: { students: { connect: { id: userId } } }
    });

    await prisma.studentProfile.updateMany({
      where: { userId },
      data: { placementStatus: "APPLIED" }
    });

    return true;
  },

  async getApplicants(driveId) {
    const drive = await prisma.placementDrive.findUnique({
      where: { id: driveId },
      include: {
        company: true,
        students: {
          select: {
            id: true, name: true, email: true, usn: true, fullName: true,
            StudentProfile: { select: { cgpa: true, readinessScore: true, branch: true, placementStatus: true } }
          }
        }
      }
    });

    if (!drive) throw new Error("Drive not found");

    return {
      drive,
      applicants: drive.students.map(u => ({
        id: u.id,
        name: u.name || u.fullName || u.email.split("@")[0],
        email: u.email,
        roll: u.usn || "N/A",
        cgpa: u.StudentProfile?.cgpa ?? 0,
        readiness: u.StudentProfile?.readinessScore ?? 0,
        branch: u.StudentProfile?.branch ?? "—",
        placementStatus: u.StudentProfile?.placementStatus ?? "APPLIED",
      }))
    };
  }
};
