import prisma from "../prisma/prismaClient.js";
import { SortType } from "../constants/common.js";

export const fetchPaginatedData = async (
  modelName,
  page,
  limit,
  filter = {},
  sort = { createdAt: SortType.DESC }
) => {
  page = page ? parseInt(page) : 1;
  limit = limit ? parseInt(limit) : 10;
  const skip = (page - 1) * limit;

  const dataPromise = prisma[modelName].findMany({
    where: filter,
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
