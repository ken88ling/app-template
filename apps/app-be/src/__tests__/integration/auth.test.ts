import request from "supertest";
import app from "../../app";
import prisma from "../../database/client";
import { UserRole, UserStatus } from "@app/shared-types";

describe("Auth API Integration Tests", () => {
  beforeAll(async () => {
    // Clean database before tests
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/v1/auth/register", () => {
    it("should register a new user with valid data", async () => {
      const userData = {
        email: "test@example.com",
        password: "Test@1234",
        firstName: "John",
        lastName: "Doe",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user.role).toBe(UserRole.USER);
    });

    it("should fail with weak password", async () => {
      const userData = {
        email: "weak@example.com",
        password: "weak",
        firstName: "Weak",
        lastName: "User",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: "password",
          message: expect.stringContaining("at least 8 characters"),
        })
      );
    });

    it("should fail with duplicate email", async () => {
      const userData = {
        email: "test@example.com", // Already registered
        password: "Test@1234",
        firstName: "Jane",
        lastName: "Doe",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.error.message).toContain("already exists");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "Test@1234",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it("should fail with invalid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "Wrong@1234",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.error.message).toContain("Invalid credentials");
    });

    it("should be rate limited after multiple failed attempts", async () => {
      const loginData = {
        email: "test@example.com",
        password: "Wrong@1234",
      };

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post("/api/v1/auth/login")
          .send(loginData);
      }

      // 6th attempt should be rate limited
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(429);

      expect(response.text).toContain("Too many authentication attempts");
    });
  });
});