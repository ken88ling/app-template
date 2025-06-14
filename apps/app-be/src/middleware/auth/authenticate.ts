import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../config/jwt";
import { extractBearerToken } from "../../utils/auth";
import { ApiError } from "../error/errorHandler";
import logger from "../../utils/logger";
import prisma from "../../database/client";
import { UserRole, UserStatus } from "@app/shared-types";
import cacheService from "../../services/cache";

export interface AuthRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw new ApiError("No token provided", 401, "NO_TOKEN");
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Try to get user from cache first
    const cacheKey = cacheService.generateKey("user", payload.userId);
    const cachedUser = await cacheService.get(cacheKey);
    
    let user;
    if (cachedUser) {
      user = JSON.parse(cachedUser);
    } else {
      // Get user from database
      user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (user) {
        // Cache user for 5 minutes
        await cacheService.set(cacheKey, JSON.stringify(user), 300);
      }
    }

    if (!user) {
      throw new ApiError("User not found", 401, "USER_NOT_FOUND");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ApiError("Account is not active", 403, "ACCOUNT_INACTIVE");
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      status: user.status as UserStatus,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError("Invalid token", 401, "INVALID_TOKEN"));
    }
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (token) {
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (user && user.status === UserStatus.ACTIVE) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role as UserRole,
          status: user.status as UserStatus,
        };
      }
    }
  } catch (error) {
    logger.debug("Optional auth error ignored:", error);
    // Ignore errors for optional auth
  }

  next();
};
