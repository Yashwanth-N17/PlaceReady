import { NotificationService } from "../services/notification.service.js";
import { success, error } from "../utils/response.js";

export const getNotifications = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const data = await NotificationService.getUserNotifications(userId, role);
    return success(res, data);
  } catch (err) {
    return error(res, "Failed to load notifications", 500, err);
  }
};

export const markNotificationRead = async (req, res) => {
  return success(res, null, "Notification marked as read");
};
