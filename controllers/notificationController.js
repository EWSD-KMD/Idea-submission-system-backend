import prisma from "../prisma/prismaClient.js";
import response from "../utils/response.js";
import { userSession } from "../utils/userSession.js";

export const getNotifications = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = page ? parseInt(page, 10) : 1;
    limit = limit ? parseInt(limit, 10) : 10;
    const skip = (page - 1) * limit;

    const userId = userSession.getUserId();

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          type: true,
          message: true,
          isRead: true,
          createdAt: true,
          fromUser: {
            select: {
              id: true,
              name: true
            }
          },
          idea: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }),
      prisma.notification.count({
        where: { userId }
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return response.success(res, {
      notifications,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return response.error(res, 500, "Error fetching notifications");
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = userSession.getUserId();

    await prisma.notification.update({
      where: {
        id: parseInt(id, 10)
      },
      data: {
        isRead: true
      }
    });

    return response.success(res, { message: "Notification marked as read" });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    return response.error(res, 500, "Error marking notification as read");
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = userSession.getUserId();

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return response.success(res, { message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    return response.error(res, 500, "Error marking all notifications as read");
  }
};