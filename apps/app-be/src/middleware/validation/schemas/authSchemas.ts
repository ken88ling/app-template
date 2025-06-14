import { body, ValidationChain } from "express-validator";

// Password validation rules
const passwordValidation = () =>
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character (@$!%*?&)")
    .not()
    .isIn(["password", "12345678", "password123", "admin123"])
    .withMessage("Password is too common");

export const registerSchema: ValidationChain[] = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  passwordValidation(),
  body("firstName").notEmpty().withMessage("First name is required").trim(),
  body("lastName").notEmpty().withMessage("Last name is required").trim(),
];

export const loginSchema: ValidationChain[] = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const refreshTokenSchema: ValidationChain[] = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

export const changePasswordSchema: ValidationChain[] = [
  body("oldPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("New password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("New password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("New password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("New password must contain at least one special character (@$!%*?&)")
    .not()
    .isIn(["password", "12345678", "password123", "admin123"])
    .withMessage("Password is too common")
    .custom((value, { req }) => value !== req.body.oldPassword)
    .withMessage("New password must be different from current password"),
];

export const emailVerificationSchema: ValidationChain[] = [
  body("token").notEmpty().withMessage("Verification token is required"),
];

export const passwordResetRequestSchema: ValidationChain[] = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
];

export const passwordResetSchema: ValidationChain[] = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character (@$!%*?&)")
    .not()
    .isIn(["password", "12345678", "password123", "admin123"])
    .withMessage("Password is too common"),
];