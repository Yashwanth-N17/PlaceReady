import { prisma } from "../config/db.js";
import { NotificationService } from "./notification.service.js";

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
    const drive = await prisma.placementDrive.findUnique({
      where: { id: driveId },
      include: { company: true }
    });
    if (!drive) throw new Error("Drive not found");

    const student = await prisma.studentProfile.findUnique({
      where: { userId }
    });
    if (!student) throw new Error("Student profile not found. Please complete your profile first.");

    // Logic: minCgpa and minReadiness check
    const minCgpa = drive.company.minCgpa || 0;
    const minReadiness = drive.company.minReadiness || 0;

    if ((student.cgpa || 0) < minCgpa) {
      throw new Error(`Ineligible: Minimum CGPA required is ${minCgpa}. Your CGPA is ${student.cgpa || 0}.`);
    }

    if ((student.readinessScore || 0) < minReadiness) {
      throw new Error(`Ineligible: Minimum Readiness Score required is ${minReadiness}%. Your score is ${student.readinessScore || 0}%.`);
    }

    const existing = await prisma.placementDrive.findFirst({
      where: { id: driveId, students: { some: { id: userId } } }
    });
    if (existing) throw new Error("Already applied to this drive");

    await prisma.placementDrive.update({
      where: { id: driveId },
      data: { students: { connect: { id: userId } } }
    });

    await prisma.studentProfile.update({
      where: { userId },
      data: { placementStatus: "APPLIED" }
    });

    await NotificationService.createNotification(userId, {
      title: "Drive Application",
      message: `You have successfully applied to ${drive.company.name} - ${drive.role}. Check your dashboard for status updates.`,
      type: "DRIVE"
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
  },

  async getTrends() {
    // Generate placement trends aggregated data
    const drives = await prisma.placementDrive.findMany({
      include: {
        students: {
          include: { StudentProfile: { select: { placementStatus: true } } }
        }
      }
    });

    // Group by month
    const monthlyData = {};
    drives.forEach(drive => {
      const monthRaw = drive.date || drive.createdAt;
      const month = new Date(monthRaw).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { name: month, companies: 0, offers: 0 };
      }
      monthlyData[month].companies += 1;
      monthlyData[month].offers += drive.students.filter(
        s => s.StudentProfile?.placementStatus === "OFFERED" || s.StudentProfile?.placementStatus === "PLACED"
      ).length;
    });

    const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const placementTrends = monthsOrder
      .filter(m => monthlyData[m])
      .map(m => monthlyData[m]);

    return { placementTrends };
  }
};
