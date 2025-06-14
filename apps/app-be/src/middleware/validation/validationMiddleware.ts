import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";
import { ApiError } from "../error/errorHandler";

export const validate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors
      .array()
      .reduce((acc: any, error: ValidationError) => {
        if ("path" in error) {
          acc[error.path] = error.msg;
        }
        return acc;
      }, {});

    throw new ApiError(
      "Validation failed",
      422,
      "VALIDATION_ERROR",
      formattedErrors
    );
  }

  next();
};
