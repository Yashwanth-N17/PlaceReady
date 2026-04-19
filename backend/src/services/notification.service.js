import { prisma } from "../config/db.js";
import { timeAgo } from "../utils/time.js";

export const NotificationService = {
  async getUserNotifications(userId, role) {
    const notifications = [];

    // 1. Upcoming Assessments (STUDENT)
    if (role === "STUDENT") {
      const upcoming = await prisma.assessment.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        take: 5,
        orderBy: { createdAt: "desc" }
      });
      upcoming.forEach(a => {
        notifications.push({
          id: `test-${a.id}`,
          title: "New Assessment Scheduled",
          message: `${a.title} is now active in ${a.subject}.`,
          time: timeAgo(a.createdAt),
          type: "test",
          read: false
        });
      });

      // 2. Recent Results
      const results = await prisma.assessmentAttempt.findMany({
        where: { userId },
        include: { assessment: { select: { title: true } } },
        take: 3,
        orderBy: { createdAt: "desc" }
      });
      results.forEach(r => {
        notifications.push({
          id: `res-${r.id}`,
          title: "Result Published",
          message: `You scored ${Math.round(r.score)}% in ${r.assessment.title}.`,
          time: timeAgo(r.createdAt),
          type: "result",
          read: true
        });
      });
    }

    // 3. Drive Updates (FACULTY / PLACEMENT)
    if (role === "FACULTY" || role === "PLACEMENT") {
      const drives = await prisma.placementDrive.findMany({
        include: { company: true },
        take: 3,
        orderBy: { createdAt: "desc" }
      });
      drives.forEach(d => {
        notifications.push({
          id: `dr-${d.id}`,
          title: "Drive Update",
          message: `${d.company.name} drive is scheduled for ${new Date(d.date).toLocaleDateString()}.`,
          time: timeAgo(d.createdAt),
          type: "drive",
          read: false
        });
      });
    }

    return notifications;
  }
};
