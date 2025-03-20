import {
  decodeToken,
  isValidTokenDate,
  retriveBearerToken,
  verifyToken,
} from "../utils/jwt.js";

import response from "../utils/response.js";
import { asyncLocalStorage } from "../utils/asyncLocalStorage.js";
import { JwtTokenType } from "../constants/jwtConstant.js";
import { AppError } from "../utils/appError.js";
import prisma from "../prisma/prismaClient.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const bearerToken = retriveBearerToken(req.headers.authorization);

    await verifyToken(bearerToken, JwtTokenType.ACCESS_TOKEN);

    const { userId } = await decodeToken(bearerToken);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const decodedToken = await decodeToken(bearerToken);
    if (!isValidTokenDate(decodedToken.iat, user?.passwordUpdatedAt)) {
      throw new AppError("Unauthorized", 401);
    }
    const map = new Map();
    map.set("userId", userId);
    asyncLocalStorage.run(map, () => {
      next();
    });
  } catch (error) {
    return response.error(res, 401, "Unauthorized");
  }
};
