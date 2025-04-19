import { Status } from "../constants/common.js";
import prisma from "../prisma/prismaClient.js";
import { ideaService } from "../services/idea.service.js";
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
        ideaId,
      },
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

    const filter = { ideaId: parseInt(ideaId, 10), status: Status.SHOW };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          anonymous: true,
          status: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          idea: {
            select: {
              departmentId: true,
              department: true,
              category: true,
              categoryId: true,
            },
          },
        },
      }),
      prisma.comment.count({
        where: filter,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const transformedComments = comments.map(comment => ({
      ...comment,
      user: comment.anonymous ? {
        id: comment.user.id,
        name: "Anonymous"
      } : comment.user
    }));

    return response.success(res, {
      comments: transformedComments,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return response.error(res, 500, "Error fetching comments");
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { ideaId } = req.params;
    const { content, anonymous = false } = req.body;

    if (!content) {
      return response.error(res, 400, "Comment content is required");
    }

    const { comment, userId, idea } = await ideaService.commentIdea(
      ideaId,
      content,
      anonymous
    );

    // Create notification for idea owner
    await createNotification(
      userId,
      parseInt(ideaId, 10),
      idea.userId,
      `${anonymous ? 'Anonymous user' : 'Someone'} commented on your idea "${idea.title}"`
    );

    const transformedComment = {
      ...comment,
      user: anonymous ? {
        id: comment.user.id,
        name: "Anonymous",
      } : comment.user
    };

    return response.success(res, transformedComment);
  } catch (err) {
    console.error("Error creating comment:", err);
    next(err);
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
      where: { id: parseInt(id, 10) },
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
            email: true,
          },
        },
      },
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
      where: { id: parseInt(id, 10) },
    });

    if (!comment) {
      return response.error(res, 404, "Comment not found");
    }

    if (comment.userId !== userId) {
      return response.error(res, 403, "Not authorized to delete this comment");
    }

    await prisma.comment.delete({
      where: { id: parseInt(id, 10) },
    });

    return response.success(res, { message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    return response.error(res, 500, "Error deleting comment");
  }
};
