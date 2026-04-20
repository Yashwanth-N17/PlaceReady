import { NotificationService } from "../services/notification.service.js";
import { success, error } from "../utils/response.js";

export const getNotifications = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const data = await NotificationService.getUserNotifications(userId);
    return success(res, data);
  } catch (err) {
    return error(res, "Failed to load notifications", 500, err);
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationService.markAsRead(id);
    return success(res, null, "Notification marked as read");
  } catch (err) {
    return error(res, "Failed to update notification", 500, err);
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const { id: userId } = req.user;
    await NotificationService.markAllAsRead(userId);
    return success(res, null, "All notifications marked as read");
  } catch (err) {
    return error(res, "Failed to update notifications", 500, err);
  }
};