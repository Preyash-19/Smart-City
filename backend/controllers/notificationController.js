import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Get notifications for logged-in user only
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
};

// 2. Mark a single notification as read (with strict ownership check)
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    const existingNotif = await prisma.notification.findUnique({
      where: { id }
    });

    if (!existingNotif) {
      return res.status(404).json({ error: "Notification not found." });
    }

    if (existingNotif.userId !== userId) {
      return res.status(403).json({ error: "Access Denied: Cannot modify another user's notification." });
    }

    const updatedNotif = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.status(200).json({
      message: "Notification marked as read.",
      notification: updatedNotif
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ error: "Failed to update notification status." });
  }
};

// 3. Mark all notifications as read for logged-in user
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("Error updating all notifications:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read." });
  }
};
