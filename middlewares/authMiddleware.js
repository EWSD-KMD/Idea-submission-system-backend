import { decodeToken, retriveBearerToken, verifyToken } from "../utils/jwt.js";

import response from "../utils/response.js";
import { asyncLocalStorage } from "../utils/asyncLocalStorage.js";
import { JwtTokenType } from "../constants/jwtConstant.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const bearerToken = retriveBearerToken(req.headers.authorization);
    await verifyToken(bearerToken, JwtTokenType.ACCESS_TOKEN);
    const { userId } = await decodeToken(bearerToken);
    const map = new Map();
    map.set("userId", userId);
    asyncLocalStorage.run(map, () => {
      next();
    });
  } catch (error) {
    return response.error(res, 400, error.message);
  }
};
