import Joi from "joi";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Define environment schema
const envSchema = Joi.object({
  // Node environment
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),

  // Server
  PORT: Joi.number().default(3000),

  // Database
  DATABASE_URL: Joi.string().required().description("Database connection URL"),

  // JWT
  JWT_SECRET: Joi.string().required().min(32).description("JWT secret key"),
  JWT_EXPIRES_IN: Joi.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),

  // Email
  SMTP_HOST: Joi.string().description("SMTP host for email"),
  SMTP_PORT: Joi.number().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().description("SMTP username"),
  SMTP_PASS: Joi.string().description("SMTP password"),
  EMAIL_FROM: Joi.string().default("noreply@app.com"),

  // CORS
  CORS_ORIGIN: Joi.string().default("*"),

  // Frontend URLs
  FRONTEND_URL: Joi.string().default("http://localhost:3001"),
  ADMIN_URL: Joi.string().default("http://localhost:3002"),

  // File upload
  UPLOAD_PATH: Joi.string().default("uploads"),
  MAX_FILE_SIZE: Joi.number().default(10 * 1024 * 1024), // 10MB

  // Redis (optional for caching - falls back to in-memory)
  REDIS_URL: Joi.string().optional().description("Redis URL for caching (optional)"),
  REDIS_TTL: Joi.number().default(300), // 5 minutes
}).unknown();

// Validate environment variables
const { value: envVars, error } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export validated environment variables
export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  database: {
    url: envVars.DATABASE_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      secure: envVars.SMTP_SECURE,
      auth: {
        user: envVars.SMTP_USER,
        pass: envVars.SMTP_PASS,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  cors: {
    origin: envVars.CORS_ORIGIN,
  },
  frontend: {
    url: envVars.FRONTEND_URL,
    adminUrl: envVars.ADMIN_URL,
  },
  upload: {
    path: envVars.UPLOAD_PATH,
    maxFileSize: envVars.MAX_FILE_SIZE,
  },
  redis: {
    url: envVars.REDIS_URL,
    ttl: envVars.REDIS_TTL,
  },
};

export default config;