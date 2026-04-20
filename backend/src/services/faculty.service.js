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
  },

  async getStudentById(id) {
    const u = await prisma.user.findUnique({
      where: { id },
      include: {
        StudentProfile: true,
        assessmentAttempts: {
          include: { assessment: true },
          orderBy: { createdAt: "desc" }
        }
      }
    });
    
    if (!u) throw new Error("Student not found");

    const profile = u.StudentProfile;
    const displayName = u.name || u.fullName || u.email.split("@")[0].replace(/[._]/g, " ");

    // ── Behavioral Benchmarking ──────────────────────────────────────
    // Compute a 0-100 "Professional Discipline Score" from proctoring data.
    // Each focus loss (tab switch) is penalised. A clean attempt = 100 pts.
    const attempts = u.assessmentAttempts;
    let disciplineScore = 100;
    let totalFocusLoss = 0;
    if (attempts.length > 0) {
      totalFocusLoss = attempts.reduce((sum, a) => sum + (a.focusLossCount || 0), 0);
      const avgFocusLoss = totalFocusLoss / attempts.length;
      // Each focus loss beyond 0 costs 8 points; clamp between 0-100
      disciplineScore = Math.max(0, Math.min(100, Math.round(100 - avgFocusLoss * 8)));
    }

    const disciplineLabel =
      disciplineScore >= 90 ? "Exceptional" :
      disciplineScore >= 75 ? "Professional" :
      disciplineScore >= 55 ? "Moderate" : "Needs Improvement";

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
      aiFeedback: profile?.aiFeedback || null,
      // Proctoring / discipline data
      disciplineScore,
      disciplineLabel,
      totalFocusLoss,
      assessmentsAttempted: attempts.length,
      attempts: attempts.map(a => ({
        id: a.id,
        title: a.assessment.title,
        date: a.createdAt,
        score: a.score,
        focusLossCount: a.focusLossCount || 0,
      }))
    };
  },

  async getDashStats() {
    const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
    const totalAssessments = await prisma.assessment.count();
    
    // Simple batch avg
    const attempts = await prisma.assessmentAttempt.findMany({ select: { score: true } });
    const batchAvg = attempts.length > 0 
      ? attempts.reduce((s, a) => s + a.score, 0) / attempts.length 
      : 0;

    return {
      totalStudents,
      totalAssessments,
      batchAvg: Math.round(batchAvg),
      participationRate: 85 // Mock or calculate
    };
  },

  async getBatchPerformance() {
    // Return sample or actual batch array
    return [
      { batch: "CSE-A", apt: 72, code: 68, core: 75, soft: 85 },
      { batch: "CSE-B", apt: 65, code: 71, core: 70, soft: 80 },
      { batch: "ISE-A", apt: 78, code: 82, core: 68, soft: 77 },
      { batch: "ECE-A", apt: 85, code: 65, core: 82, soft: 75 }
    ];
  },

  async getSkillGaps() {
    // Could eventually analyze assessments with low scores
    return [
      { topic: "Pointer Arithmetic", failRate: 42, severity: "critical" },
      { topic: "Dynamic Programming", failRate: 38, severity: "critical" },
      { topic: "Database Normalization", failRate: 31, severity: "warning" },
      { topic: "Graph Algorithms", failRate: 27, severity: "warning" },
    ];
  },

  async bulkUploadMarks(rows, facultyId) {
    const results = [];
    
    // Create/Find a generic faculty assessment for these marks if subject is provided
    const subject = rows[0]?.subject || "General";
    const examType = rows[0]?.examType || "Internal";
    
    // For each row, update student data
    for (const row of rows) {
      try {
        const student = await prisma.user.findFirst({
          where: {
            OR: [
              { id: row.studentId },
              { usn: row.roll }
            ]
          },
          include: { StudentProfile: true }
        });

        if (!student) continue;

        const updates = {};
        if (row.cgpa) updates.cgpa = parseFloat(row.cgpa);
        
        // Update profile
        if (Object.keys(updates).length > 0) {
          await prisma.studentProfile.upsert({
            where: { userId: student.id },
            update: updates,
            create: { userId: student.id, id: student.usn || student.id, ...updates }
          });
        }

        // Create attempt if marks exist
        if (row.marks) {
          // Create dummy assessment for the record
          const assessment = await prisma.assessment.create({
            data: {
              title: `${examType}: ${subject}`,
              subject: subject,
              type: "SUBJECTIVE",
              scheduledAt: new Date(),
              duration: 0,
              createdById: facultyId
            }
          });

          await prisma.assessmentAttempt.create({
            data: {
              userId: student.id,
              assessmentId: assessment.id,
              score: parseFloat(row.marks),
              correctCount: 0,
              totalCount: 100,
              timeTaken: 0,
              answers: { imported: true }
            }
          });
        }

        results.push({ roll: row.roll, status: "success" });
      } catch (e) {
        results.push({ roll: row.roll, status: "error", message: e.message });
      }
    }

    return results;
  }
};
