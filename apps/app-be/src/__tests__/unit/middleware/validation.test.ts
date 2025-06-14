import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { validate } from "../../../middleware/validation/validationMiddleware";
import { ApiError } from "../../../middleware/error/errorHandler";

// Mock express-validator
jest.mock("express-validator", () => {
  const actual = jest.requireActual("express-validator");
  return {
    ...actual,
    validationResult: jest.fn(),
  };
});

describe("Validation Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call next() when validation passes", () => {
    const mockValidationResult = {
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([]),
    };
    (validationResult as unknown as jest.Mock).mockReturnValue(mockValidationResult);

    validate(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it("should throw ApiError when validation fails", () => {
    const errors = [
      {
        type: "field",
        msg: "Email is required",
        path: "email",
        location: "body",
      },
      {
        type: "field",
        msg: "Password must be at least 8 characters",
        path: "password",
        location: "body",
      },
    ];

    const mockValidationResult = {
      isEmpty: jest.fn().mockReturnValue(false),
      array: jest.fn().mockReturnValue(errors),
    };
    (validationResult as unknown as jest.Mock).mockReturnValue(mockValidationResult);

    expect(() => {
      validate(mockReq as Request, mockRes as Response, mockNext);
    }).toThrow(ApiError);

    expect(() => {
      validate(mockReq as Request, mockRes as Response, mockNext);
    }).toThrow("Validation failed");

    expect(mockNext).not.toHaveBeenCalled();
  });
});