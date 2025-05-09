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
import { userSession } from "../utils/userSession.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const bearerToken = retriveBearerToken(req.headers.authorization);

    await verifyToken(bearerToken, JwtTokenType.ACCESS_TOKEN);

    const { userId } = await decodeToken(bearerToken);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const decodedToken = await decodeToken(bearerToken);
    console.log("decoded token", decodedToken);
    if (!isValidTokenDate(decodedToken.iat, user?.passwordUpdatedAt)) {
      throw new AppError("Unauthorized", 401);
    }
    const map = new Map();
    map.set("userId", userId);
    asyncLocalStorage.run(map, () => {
      console.log("user map 1", map);
      next();
    });
  } catch (error) {
    console.log("error", error);
    return response.error(res, 401, "Unauthorized");
  }
};

export const disabledUserChecker = async (req, res, next) => {
  try {
    const userId = userSession.getUserId();
    console.log(userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error("user not found");
      throw new AppError("Unauthorized", 401);
    }
    console.log(user);
    if (user.disabledInd) {
      throw new AppError("User is disabled.", 401);
    }
    next();
  } catch (error) {
    return response.error(res, 401, error.message);
  }
};
