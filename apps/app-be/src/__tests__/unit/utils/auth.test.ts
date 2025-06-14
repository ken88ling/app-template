import { hashPassword, verifyPassword, generateTokenId, extractBearerToken } from "../../../utils/auth";

describe("Auth Utils", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "Test@1234";
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toEqual(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it("should generate different hashes for the same password", async () => {
      const password = "Test@1234";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toEqual(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should verify a correct password", async () => {
      const password = "Test@1234";
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "Test@1234";
      const wrongPassword = "Wrong@1234";
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe("generateTokenId", () => {
    it("should generate a token ID", () => {
      const tokenId = generateTokenId();
      
      expect(tokenId).toBeDefined();
      expect(typeof tokenId).toBe("string");
      expect(tokenId.length).toBeGreaterThan(0);
    });

    it("should generate unique token IDs", () => {
      const tokenId1 = generateTokenId();
      const tokenId2 = generateTokenId();
      
      expect(tokenId1).not.toEqual(tokenId2);
    });
  });

  describe("extractBearerToken", () => {
    it("should extract token from Bearer header", () => {
      const authHeader = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      const token = extractBearerToken(authHeader);
      
      expect(token).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    });

    it("should return null for invalid header", () => {
      expect(extractBearerToken("")).toBeNull();
      expect(extractBearerToken("InvalidHeader")).toBeNull();
      expect(extractBearerToken("Bearer")).toBeNull();
      expect(extractBearerToken("Token abc123")).toBeNull();
    });
  });
});