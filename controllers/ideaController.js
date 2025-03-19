import { PrismaClient } from "@prisma/client";
import response from "../utils/response.js";
import { userSession } from "../utils/userSession.js";

const prisma = new PrismaClient();

export const getAllIdeas = async (req, res) => {
  try {
    let { page, limit, status } = req.query;
    page = page ? parseInt(page, 10) : 1;
    limit = limit ? parseInt(limit, 10) : 10;
    const skip = (page - 1) * limit;

    const where = {
      status: status || 'SHOW'
    };

    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        skip,
        take: limit,
        where,
        include: {
          category: true,
          department: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.idea.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return response.success(res, {
      ideas,
      page,
      limit,
      total,
      totalPages
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
            email: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!idea) {
      return response.error(res, 404, "Idea not found");
    }

    // Increment views
    await prisma.idea.update({
      where: { id },
      data: { views: idea.views + 1 }
    });

    return response.success(res, idea);
  } catch (err) {
    console.error("Error fetching idea:", err);
    return response.error(res, 500, "Error fetching idea");
  }
};

export const createIdea = async (req, res) => {
  try {
    const { title, description, categoryId, departmentId } = req.body;
    const userId = userSession.getUserId();

    const newIdea = await prisma.idea.create({
      data: {
        title,
        description,
        categoryId,
        departmentId,
        userId
      },
      include: {
        category: true,
        department: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
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
    const { title, description, categoryId, departmentId, status } = req.body;

    const updatedIdea = await prisma.idea.update({
      where: { id },
      data: {
        title,
        description,
        categoryId,
        departmentId,
        status
      },
      include: {
        category: true,
        department: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
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
      data: { status: 'DELETED' }
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
    const idea = await prisma.idea.update({
      where: { id },
      data: {
        likes: {
          increment: 1
        }
      }
    });
    return response.success(res, idea);
  } catch (err) {
    console.error("Error liking idea:", err);
    return response.error(res, 500, "Error liking idea");
  }
};

export const dislikeIdea = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const idea = await prisma.idea.update({
      where: { id },
      data: {
        dislikes: {
          increment: 1
        }
      }
    });
    return response.success(res, idea);
  } catch (err) {
    console.error("Error disliking idea:", err);
    return response.error(res, 500, "Error disliking idea");
  }
};