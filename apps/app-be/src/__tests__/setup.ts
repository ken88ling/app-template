import dotenv from "dotenv";
import path from "path";

// Load test environment variables
dotenv.config({
  path: path.join(__dirname, "../../.env.test"),
});

// Set test database
process.env.DATABASE_URL = "file:./test.db";

// Mock logger to avoid console output during tests
jest.mock("../utils/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
  stream: {
    write: jest.fn(),
  },
}));

// Increase timeout for database operations
jest.setTimeout(30000);