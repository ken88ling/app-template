import jwt, { SignOptions } from "jsonwebtoken";
import { TokenPayload, RefreshTokenPayload } from "@app/shared-types";
import { config } from "./env";

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn,
  } as SignOptions;
  return jwt.sign(payload, config.jwt.secret, options);
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn,
  } as SignOptions;
  return jwt.sign(payload, config.jwt.secret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, config.jwt.secret) as RefreshTokenPayload;
};