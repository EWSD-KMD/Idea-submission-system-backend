import { PrismaClient } from "@prisma/client";
import response from "../utils/response.js";
import { userSession } from "../utils/userSession.js";
import { ideaReportService } from "../services/ideaReport.service.js";
import { ideaService } from "../services/idea.service.js";
import { streamService } from "../services/streaming.service.js";
import { Role } from "../constants/common.js";

const prisma = new PrismaClient();

const createNotification = async (
  type,
  fromUserId,
  ideaId,
  ideaOwnerId,
  message
) => {
  if (fromUserId !== ideaOwnerId) {
    await prisma.notification.create({
      data: {
        type,
        message,
        userId: ideaOwnerId,
        fromUserId,
        ideaId,
      },
    });
  }
};

export const getAllIdeas = async (req, res) => {
  try {
    let { page, limit, status, departmentId, categoryId, userId, sortBy } =
      req.query;
    page = page ? parseInt(page, 10) : 1;
    limit = limit ? parseInt(limit, 10) : 10;
    const skip = (page - 1) * limit;

    const sortOptions = {
      latest: { createdAt: "desc" },
      popular: { likes: "desc" },
      mostViewed: { views: "desc" },
      latestComment: [{ lastCommentAt: "desc" }, { createdAt: "desc" }],
    };

    const orderBy = sortOptions[sortBy] || sortOptions.latest;

    const loginUserId = userSession.getUserId();
    const user = await prisma.user.findUnique({
      where: { id: loginUserId },
      include: { role: true },
    });

    if (user.type !== "USER" && user.role.name !== Role.QA_MANAGER) {
      departmentId = user.departmentId;
    }

    const where = {
      status: status || "SHOW",
      ...(departmentId && { departmentId: parseInt(departmentId, 10) }),
      ...(categoryId && { categoryId: parseInt(categoryId, 10) }),
      ...(userId && { userId: parseInt(userId, 10) }),
    };
    // console.log("where", where);
    console.log("orderBy", orderBy);
    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        include: {
          category: true,
          department: true,
          academicYear: {
            select: {
              id: true,
              year: true,
              startDate: true,
              closureDate: true,
              finalClosureDate: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          files: {
            select: {
              id: true,
              fileName: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  department: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          _count: {
            select: {
              comments: true,
              reports: true,
            },
          },
        },
      }),
      prisma.idea.count({ where }),
    ]);

    console.log("ideas", ideas);

    // Transform ideas to handle anonymous posts
    const transformedIdeas = await Promise.all(
      ideas.map(async (idea) => {
        const notis = await prisma.notification.findMany({
          where: {
            ideaId: idea.id,
            fromUserId: userSession.getUserId(),
            type: {
              in: ["LIKE", "DISLIKE"],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        const noti = notis[0];

        return {
          ...idea,
          user: idea.anonymous
            ? {
                id: idea.user.id,
                name: "Anonymous",
                department: idea.user.department,
              }
            : idea.user,
          comments: idea.comments.map((comment) => ({
            ...comment,
            user: idea.anonymous
              ? {
                  id: comment.user.id,
                  name:
                    comment.user.id === idea.userId
                      ? "Anonymous (Author)"
                      : comment.user.name,
                  department: comment.user.department,
                }
              : comment.user,
          })),
          likeInd: noti?.type === "LIKE",
          dislikeInd: noti?.type === "DISLIKE",
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    return response.success(res, {
      ideas: transformedIdeas,
      page,
      limit,
      total,
      totalPages,
      filters: {
        departmentId: departmentId ? parseInt(departmentId, 10) : null,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        userId: userId ? parseInt(userId, 10) : null,
        status,
        sortBy: sortBy || "latest",
      },
    });
  } catch (err) {
    console.error("Error fetching ideas:", err);
    return response.error(res, 500, "Error fetching ideas");
  }
};

export const getIdeaById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        category: true,
        department: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        files: {
          select: {
            id: true,
            fileName: true,
          },
        },
      },
    });

    if (!idea || idea.status !== "SHOW") {
      return response.error(res, 404, "Idea not found");
    }

    // Increment view count
    await prisma.idea.update({
      where: { id },
      data: { views: idea.views + 1 },
    });

    // Transform the response to handle anonymous content
    const transformedIdea = {
      ...idea,
      user: idea.anonymous
        ? {
            id: idea.user.id,
            name: "Anonymous",
            department: idea.user.department,
          }
        : idea.user,
      comments: idea.comments.map((comment) => ({
        ...comment,
        user: idea.anonymous
          ? {
              id: comment.user.id,
              name:
                comment.user.id === idea.userId
                  ? "Anonymous (Author)"
                  : comment.user.name,
              department: comment.user.department,
            }
          : comment.user,
      })),
    };

    return response.success(res, transformedIdea);
  } catch (err) {
    console.error("Error fetching idea:", err);
    return response.error(res, 500, "Error fetching idea");
  }
};

export const createIdea = async (req, res) => {
  try {
    const {
      title,
      description,
      categoryId,
      departmentId,
      anonymous = false,
      files,
    } = req.body;
    const newIdea = await ideaService.createIdea({
      title,
      description,
      categoryId,
      departmentId,
      anonymous,
      files,
    });

    return response.success(res, newIdea);
  } catch (err) {
    console.error("Error creating idea:", err);
    return response.error(res, 500, "Error creating idea");
  }
};

export const updateIdea = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      title,
      description,
      categoryId,
      departmentId,
      anonymous = false,
      status,
    } = req.body;

    const updatedIdea = await prisma.idea.update({
      where: { id },
      data: {
        title,
        description,
        categoryId,
        departmentId,
        anonymous,
        status,
      },
      include: {
        category: true,
        department: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return response.success(res, updatedIdea);
  } catch (err) {
    console.error("Error updating idea:", err);
    return response.error(res, 500, "Error updating idea");
  }
};

export const deleteIdea = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.idea.update({
      where: { id },
      data: { status: "DELETED" },
    });
    return response.success(res, { message: "Idea deleted successfully" });
  } catch (err) {
    console.error("Error deleting idea:", err);
    return response.error(res, 500, "Error deleting idea");
  }
};

export const likeIdea = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = userSession.getUserId();

    // First get the idea to check ownership
    const idea = await prisma.idea.findUnique({
      where: { id },
    });

    if (!idea) {
      return response.error(res, 404, "Idea not found");
    }

    if (userId === idea.userId) {
      return response.error(res, 400, "You cannot like your own idea");
    }

    // Check for existing like and dislike
    const [existingLike, existingDislike] = await Promise.all([
      prisma.notification.findFirst({
        where: {
          ideaId: id,
          fromUserId: userId,
          type: "LIKE",
        },
      }),
      prisma.notification.findFirst({
        where: {
          ideaId: id,
          fromUserId: userId,
          type: "DISLIKE",
        },
      }),
    ]);

    // Start a transaction for multiple operations
    const result = await prisma.$transaction(async (prisma) => {
      // If there's an existing dislike, remove it
      if (existingDislike) {
        await prisma.notification.delete({
          where: { id: existingDislike.id },
        });
        await prisma.idea.update({
          where: { id },
          data: {
            dislikes: {
              decrement: 1,
            },
          },
        });
      }

      // Handle like toggle
      if (existingLike) {
        await prisma.notification.delete({
          where: { id: existingLike.id },
        });
        const updatedIdea = await prisma.idea.update({
          where: { id },
          data: {
            likes: {
              decrement: 1,
            },
          },
        });
        return { updatedIdea, liked: false };
      } else {
        const updatedIdea = await prisma.idea.update({
          where: { id },
          data: {
            likes: {
              increment: 1,
            },
          },
        });
        await createNotification(
          "LIKE",
          userId,
          id,
          idea.userId,
          `liked your idea "${idea.title}"`
        );
        return { updatedIdea, liked: true };
      }
    });

    return response.success(res, {
      ...result.updatedIdea,
      liked: result.liked,
      message: result.liked
        ? "Idea liked successfully"
        : "Like removed successfully",
    });
  } catch (err) {
    console.error("Error liking idea:", err);
    return response.error(res, 500, "Error liking idea");
  }
};

export const dislikeIdea = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = userSession.getUserId();

    const idea = await prisma.idea.findUnique({
      where: { id },
    });

    if (!idea) {
      return response.error(res, 404, "Idea not found");
    }

    if (userId === idea.userId) {
      return response.error(res, 400, "You cannot dislike your own idea");
    }

    // Check for existing like and dislike
    const [existingLike, existingDislike] = await Promise.all([
      prisma.notification.findFirst({
        where: {
          ideaId: id,
          fromUserId: userId,
          type: "LIKE",
        },
      }),
      prisma.notification.findFirst({
        where: {
          ideaId: id,
          fromUserId: userId,
          type: "DISLIKE",
        },
      }),
    ]);

    // Start a transaction for multiple operations
    const result = await prisma.$transaction(async (prisma) => {
      // If there's an existing like, remove it
      if (existingLike) {
        await prisma.notification.delete({
          where: { id: existingLike.id },
        });
        await prisma.idea.update({
          where: { id },
          data: {
            likes: {
              decrement: 1,
            },
          },
        });
      }

      // Handle dislike toggle
      if (existingDislike) {
        await prisma.notification.delete({
          where: { id: existingDislike.id },
        });
        const updatedIdea = await prisma.idea.update({
          where: { id },
          data: {
            dislikes: {
              decrement: 1,
            },
          },
        });
        return { updatedIdea, disliked: false };
      } else {
        const updatedIdea = await prisma.idea.update({
          where: { id },
          data: {
            dislikes: {
              increment: 1,
            },
          },
        });
        await createNotification(
          "DISLIKE",
          userId,
          id,
          idea.userId,
          `disliked your idea "${idea.title}"`
        );
        return { updatedIdea, disliked: true };
      }
    });

    return response.success(res, {
      ...result.updatedIdea,
      disliked: result.disliked,
      message: result.disliked
        ? "Idea disliked successfully"
        : "Dislike removed successfully",
    });
  } catch (err) {
    console.error("Error disliking idea:", err);
    return response.error(res, 500, "Error disliking idea");
  }
};

export const reportIdea = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { type, detail } = req.body;
    const data = await ideaReportService.createIdeaReport(id, type, detail);

    return response.success(res, data);
  } catch (err) {
    console.error("Error creating report:", err);
    next(err);
  }
};

export const uploadIdeaFile = async (req, res, next) => {
  try {
    const files = req.files;
    console.log(files);
    const data = await ideaService.uploadIdeaFile(files);
    return response.success(res, data);
  } catch (err) {
    console.error("Error creating report:", err);
    next(err);
  }
};

export const getIdeaFile = async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    const ideaFile = await prisma.ideaFile.findUnique({
      where: { id: fileId },
    });
    if (!ideaFile) {
      throw new AppError("File not found", 404);
    }
    const { Body, ContentType, ContentLength, ContentDisposition } =
      await ideaService.getIdeaFile(fileId);

    // Detect if Body is a stream or buffer
    const isReadable = Body && typeof Body.pipe === "function";

    res.setHeader("Content-Type", ContentType || "application/octet-stream");
    if (ContentLength) res.setHeader("Content-Length", ContentLength);
    res.setHeader(
      "Content-Disposition",
      ContentDisposition || `inline; filename="${ideaFile.fileName}"`
    );

    if (isReadable) {
      Body.pipe(res); // pipe stream directly
    } else {
      // fallback: if Body is a buffer or Uint8Array
      res.end(Body);
    }
  } catch (err) {
    console.error("Error creating report:", err);
    next(err);
  }
};

export const downLoadIdeaFile = async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    const ideaFile = await prisma.ideaFile.findUnique({
      where: { id: fileId },
    });
    if (!ideaFile) {
      throw new AppError("File not found", 404);
    }
    const { Body, ContentType, ContentLength, ContentDisposition } =
      await ideaService.getIdeaFile(fileId);

    // Detect if Body is a stream or buffer
    const isReadable = Body && typeof Body.pipe === "function";

    res.setHeader("Content-Type", ContentType || "application/octet-stream");
    if (ContentLength) res.setHeader("Content-Length", ContentLength);
    res.setHeader(
      "Content-Disposition",
      ContentDisposition || `attachment; filename="${ideaFile.fileName}"`
    );

    if (isReadable) {
      Body.pipe(res); // pipe stream directly
    } else {
      // fallback: if Body is a buffer or Uint8Array
      res.end(Body);
    }
  } catch (err) {
    console.error("Error creating report:", err);
    next(err);
  }
};

export const exportIdea = async (req, res, next) => {
  try {
    streamService.streamIdeasToZip(res);
  } catch (err) {
    console.error("Error creating report:", err);
    next(err);
  }
};

export const hideIdea = async (req, res, next) => {
  try {
    const { ideaId } = req.params;
    const id = parseInt(ideaId, 10);
    const idea = await prisma.idea.findUnique({
      where: { id },
    });
    await ideaService.hideIdea(parseInt(ideaId));
    if (idea.status !== "HIDE") {
      const loginUserId = userSession.getUserId();
      await createNotification(
        "HIDE",
        loginUserId,
        id,
        idea.userId,
        `Your idea "${idea.title}" has been hidden`
      );
    }
    return response.success(res);
  } catch (err) {
    console.error("Error hiding idea:", err);
    next(err);
  }
};
