import { prisma } from "../config/db.js";
import { timeAgo } from "../utils/time.js";

export const NotificationService = {
  async getUserNotifications(userId) {
    const dbNotifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return dbNotifications.map(n => ({
      ...n,
      body: n.message, // Map DB 'message' to frontend 'body'
      time: timeAgo(n.createdAt)
    }));
  },

  async createNotification(userId, data) {
    return await prisma.notification.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        type: data.type || "INFO"
      }
    });
  },

  async markAsRead(notificationId) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  },

  async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: { userId },
      data: { read: true }
    });
  },

  /**
   * Syncs dynamic alerts into the database (one-time or periodic)
   */
  async syncDynamicAlerts(userId, role) {
    // This can be called to ensure fresh DB records exist for events
    // For now, we'll implement a logic that auto-creates notifications for new assessments
    if (role === "STUDENT") {
      const assessments = await prisma.assessment.findMany({
        where: { 
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          notifications: { none: { userId } } // Logic needs a link or simplified check
        }
      });
      // Simplified: Just return what's in DB for now to keep it clean
    }
  }
};