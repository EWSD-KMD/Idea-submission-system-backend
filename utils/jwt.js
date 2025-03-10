import jwt from "jsonwebtoken";
import { AppError } from "./appError.js";
import { JwtTokenType } from "../constants/jwtConstant.js";

const generateAccessToken = async (payload) => {
  const jwtToken = await jwt.sign(
    { ...payload, type: JwtTokenType.ACCESS_TOKEN },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: 600,
    }
  );
  return jwtToken;
};

const generateRefreshToken = async (payload) => {
  const jwtToken = await jwt.sign(
    { ...payload, type: JwtTokenType.REFRESH_TOKEN },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );
  return jwtToken;
};

export const generateJwtToken = async (payload, tokenType) => {
  let jwtToken;
  switch (tokenType) {
    case JwtTokenType.ACCESS_TOKEN:
      jwtToken = await generateAccessToken(payload);
      break;
    case JwtTokenType.REFRESH_TOKEN:
      jwtToken = await generateRefreshToken(payload);
      break;
    default:
      throw new AppError("invalid token type");
  }
  return jwtToken;
};

export const retriveBearerToken = (authorization) => {
  if (!authorization) {
    throw new AppError("Authorization header is missing", 400);
  }

  const parts = authorization.split(" ");

  if (parts.length !== 2) {
    throw new AppError("Authorization header is invalid", 400);
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    throw new AppError("Authorization header is invalid", 400);
  }

  return token;
};

export const verifyToken = async (token, tokenType) => {
  switch (tokenType) {
    case JwtTokenType.ACCESS_TOKEN:
      await jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
      break;
    case JwtTokenType.REFRESH_TOKEN:
      await jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
      break;
    default:
      throw new AppError("invalid token type");
  }
};

export const decodeToken = async (token) => {
  return await jwt.decode(token);
};

export const getExpireDateFromToken = async (token) => {
  const decodedToken = await decodeToken(token);
  return new Date(decodedToken.exp * 1000);
};
