import { prisma } from "../config/db.js";

/**
 * GET /api/notifications
 * Returns notifications relevant to the authenticated user.
 * Auto-generates them from real DB events:
 *   - Newly scheduled assessments (STUDENT)
 *   - Latest attempt results (STUDENT)
 *   - Batch upload updates (FACULTY)
 */
export const getNotifications = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const notifications = [];

    if (role === "STUDENT") {
      // 1. New tests assigned to this student (scheduled in the future)
      const upcomingTests = await prisma.assessment.findMany({
        where: {
          students: { some: { id: userId } },
          scheduledAt: { gte: new Date() },
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
        select: { id: true, title: true, scheduledAt: true, createdAt: true },
      });
      upcomingTests.forEach((t) => {
        notifications.push({
          id: `test-${t.id}`,
          type: "test",
          title: "New test scheduled",
          body: `"${t.title}" is scheduled for ${new Date(t.scheduledAt).toLocaleDateString()}.`,
          time: timeAgo(t.createdAt),
          read: false,
        });
      });

      // 2. Recent attempt results
      const recentAttempts = await prisma.assessmentAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { assessment: { select: { title: true } } },
      });
      recentAttempts.forEach((a) => {
        notifications.push({
          id: `result-${a.id}`,
          type: "readiness",
          title: "Result published",
          body: `You scored ${a.score.toFixed(1)}% in "${a.assessment.title}".`,
          time: timeAgo(a.createdAt),
          read: false,
        });
      });
    }

    if (role === "FACULTY") {
      // 1. Recent assessments this faculty created
      const ownAssessments = await prisma.assessment.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, createdAt: true, _count: { select: { attempts: true } } },
      });
      ownAssessments.forEach((a) => {
        notifications.push({
          id: `fa-${a.id}`,
          type: "marks",
          title: "Assessment active",
          body: `"${a.title}" has ${a._count.attempts} submission(s) so far.`,
          time: timeAgo(a.createdAt),
          read: false,
        });
      });
    }

    if (role === "PLACEMENT") {
      // 1. Recent placement drives
      const drives = await prisma.placementDrive.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { company: { select: { name: true } } },
      });
      drives.forEach((d) => {
        notifications.push({
          id: `drive-${d.id}`,
          type: "drive",
          title: `${d.company.name} – ${d.title}`,
          body: `Drive on ${new Date(d.date).toLocaleDateString()} · Status: ${d.status}`,
          time: timeAgo(d.createdAt),
          read: false,
        });
      });
    }

    // Sort newest first
    notifications.sort((a, b) => (a.time < b.time ? 1 : -1));
    return res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("getNotifications error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  // Client-side only for now; just acknowledge
  return res.json({ success: true });
};

export const markAllNotificationsRead = async (req, res) => {
  return res.json({ success: true });
};

// ── Helper ────────────────────────────────────────────────────────────────────
function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
