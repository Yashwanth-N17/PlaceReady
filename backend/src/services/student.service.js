import { prisma } from "../config/db.js";

export const StudentService = {
  async getDashboardStats(userId) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    const attempts = await prisma.assessmentAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const totalTests = await prisma.assessmentAttempt.count({ where: { userId } });
    const avgScore = totalTests > 0 
      ? attempts.reduce((a, b) => a + b.score, 0) / attempts.length 
      : 0;

    return {
      profile,
      stats: {
        readiness: profile?.readinessScore ?? 0,
        testsTaken: totalTests,
        avgScore: Math.round(avgScore),
        placementStatus: profile?.placementStatus ?? "UNPLACED",
        cgpa: profile?.cgpa ?? 0,
        backlogs: profile?.backlogs ?? 0
      },
      recentActivity: attempts
    };
  }
};
