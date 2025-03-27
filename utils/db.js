import prisma from "../prisma/prismaClient.js";
import { SortType } from "../constants/common.js";

export const fetchPaginatedData = async (
  modelName,
  page,
  limit,
  filter = {},
  include,
  sort = { createdAt: SortType.DESC }
) => {
  page = page ? parseInt(page) : 1;
  limit = limit ? parseInt(limit) : 10;
  const skip = (page - 1) * limit;

  const dataPromise = prisma[modelName].findMany({
    where: filter,
    ...(include && { include }),
    skip,
    take: limit,
    ...(sort && { orderBy: sort }),
  });

  const totalRecordsPromise = prisma[modelName].count({
    where: filter,
  });

  const [data, totalRecords] = await Promise.all([
    dataPromise,
    totalRecordsPromise,
  ]);

  return {
    page,
    limit,
    totalPages: Math.ceil(totalRecords / limit),
    total: totalRecords,
    data,
  };
};

export function transactional(method) {
  return async function (...args) {
    return prisma.$transaction(async (tx) => {
      this.prisma = tx;
      return method.apply(this, args);
    });
  };
}
