import prisma from "../prisma/prismaClient.js";
import response from "../utils/response.js";
import { userSession } from "../utils/userSession.js";

const createNotification = async (fromUserId, ideaId, ideaOwnerId, message) => {
  if (fromUserId !== ideaOwnerId) {
    await prisma.notification.create({
      data: {
        type: "COMMENT",
        message,
        userId: ideaOwnerId,
        fromUserId,
        ideaId
      }
    });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const { ideaId } = req.params;
    let { page, limit } = req.query;
    page = page ? parseInt(page, 10) : 1;
    limit = limit ? parseInt(limit, 10) : 10;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          ideaId: parseInt(ideaId, 10)
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.comment.count({
        where: {
          ideaId: parseInt(ideaId, 10)
        }
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return response.success(res, {
      comments,
      page,
      limit,
      total,
      totalPages
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return response.error(res, 500, "Error fetching comments");
  }
};

export const createComment = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const { content } = req.body;
    const userId = userSession.getUserId();

    if (!content) {
      return response.error(res, 400, "Comment content is required");
    }

    const idea = await prisma.idea.findUnique({
      where: { id: parseInt(ideaId, 10) },
      select: {
        userId: true,
        title: true
      }
    });

    const comment = await prisma.comment.create({
      data: {
        content,
        ideaId: parseInt(ideaId, 10),
        userId
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    //Send Email to idea owner

    // Create notification for idea owner
    await createNotification(
      userId,
      parseInt(ideaId, 10),
      idea.userId,
      `commented on your idea "${idea.title}"`
    );

    return response.success(res, comment);
  } catch (err) {
    console.error("Error creating comment:", err);
    return response.error(res, 500, "Error creating comment");
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = userSession.getUserId();

    if (!content) {
      return response.error(res, 400, "Comment content is required");
    }

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!comment) {
      return response.error(res, 404, "Comment not found");
    }

    if (comment.userId !== userId) {
      return response.error(res, 403, "Not authorized to update this comment");
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id, 10) },
      data: { content },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return response.success(res, updatedComment);
  } catch (err) {
    console.error("Error updating comment:", err);
    return response.error(res, 500, "Error updating comment");
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = userSession.getUserId();

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!comment) {
      return response.error(res, 404, "Comment not found");
    }

    if (comment.userId !== userId) {
      return response.error(res, 403, "Not authorized to delete this comment");
    }

    await prisma.comment.delete({
      where: { id: parseInt(id, 10) }
    });

    return response.success(res, { message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    return response.error(res, 500, "Error deleting comment");
  }
};