import { Status } from "../constants/common.js";
import prisma from "../prisma/prismaClient.js";
import response from "../utils/response.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Common where clause for active ideas
    const activeIdeaFilter = {
      status: Status.SHOW,
    };

    // Common where clause for active users
    const activeUserFilter = {
      deleted: false,
      disabledInd: false,
    };

    // Common where clause for active comments
    const activeCommentFilter = {
      status: Status.SHOW,
    };

    const [
      totalIdeas,
      totalLikes,
      totalDislikes,
      totalComments,
      activeUsers,
      departmentStats,
      categoryStats,
      popularIdeas,
      browserStats,
    ] = await Promise.all([
      // Get total active ideas
      prisma.idea.count({
        where: activeIdeaFilter,
      }),

      // Get total likes from active ideas
      prisma.idea.aggregate({
        where: activeIdeaFilter,
        _sum: {
          likes: true,
        },
      }),

      // Get total dislikes from active ideas
      prisma.idea.aggregate({
        where: activeIdeaFilter,
        _sum: {
          dislikes: true,
        },
      }),

      // Get total active comments
      prisma.comment.count({
        where: activeCommentFilter,
      }),

      // Get active users who have posted ideas or comments in last 30 days
      prisma.user.count({
        where: activeUserFilter,
      }),

      // Get department statistics for active ideas
      prisma.department.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              ideas: {
                where: activeIdeaFilter,
              },
            },
          },
        },
      }),

      // Get category statistics for active ideas
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              ideas: {
                where: activeIdeaFilter,
              },
            },
          },
        },
      }),

      // Get popular active ideas
      prisma.idea.findMany({
        where: activeIdeaFilter,
        take: 5,
        orderBy: [
          {
            likes: "desc",
          },
          {
            views: "desc",
          },
        ],
        select: {
          id: true,
          title: true,
          likes: true,
          views: true,
          createdAt: true,
          department: {
            select: {
              name: true,
            },
          },
        },
      }),

      prisma.user.groupBy({
        by: ["userAgent"],
        _count: {
          _all: true,
        },
      }),
    ]);

    const dashboardData = {
      overview: {
        totalIdeas,
        interactions: {
          likes: totalLikes._sum.likes || 0,
          dislikes: totalDislikes._sum.dislikes || 0,
        },
        totalComments,
        activeUsers,
      },
      departmentStats: departmentStats.map((dept) => ({
        name: dept.name,
        totalPosts: dept._count.ideas,
      })),
      categoryStats: categoryStats.map((cat) => ({
        name: cat.name,
        totalPosts: cat._count.ideas,
      })),
      popularIdeas: popularIdeas.map((idea) => ({
        title: idea.title,
        department: idea.department.name,
        votes: idea.likes,
        views: idea.views,
        date: idea.createdAt,
      })),
      browserStats: browserStats.map((browser) => ({
        name: browser.userAgent,
        totalUsers: browser._count._all,
      })),
    };

    return response.success(res, dashboardData);
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    return response.error(res, 500, "Error fetching dashboard statistics");
  }
};
