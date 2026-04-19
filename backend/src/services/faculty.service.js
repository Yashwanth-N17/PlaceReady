import { prisma } from "../config/db.js";

export const FacultyService = {
  async getAllStudents() {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { StudentProfile: true },
      orderBy: { createdAt: "asc" },
    });

    return students.map((u) => {
      const profile = u.StudentProfile;
      const displayName = u.name || u.fullName || u.email.split("@")[0].replace(/[._]/g, " ");
      
      return {
        id: u.id,
        name: displayName,
        roll: u.usn || "N/A",
        email: u.email,
        readiness: profile?.readinessScore ?? 0,
        cgpa: profile?.cgpa ?? 0,
        branch: profile?.branch ?? "—",
        semester: profile?.semester ?? "—",
        batch: "2025", 
        weak: "Aptitude", 
        active: "Active",
        hasProfile: !!profile,
      };
    });
  }
};
