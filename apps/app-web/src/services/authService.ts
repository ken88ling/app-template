import { apiClient, getServerAuthHeaders } from "./apiClient";
import {
  LoginRequest,
  RegisterRequest,
  IUserPublic,
  ApiResponse,
  WebAuthResponse as AuthResponse,
} from "@app/shared-types";
import logger from "@/utils/logger";

class AuthService {
  /**
   * Login user - uses internal API route that handles cookies
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      logger.info("Login attempt", { email: data.email }, "AuthService");
      
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        "/auth/login",
        data
      );

      // The interceptor returns response.data, so 'response' is already ApiResponse<AuthResponse>
      const result = response as unknown as ApiResponse<AuthResponse>;

      if (!result.success || !result.data) {
        logger.error("Invalid login response", { email: data.email }, "AuthService");
        throw new Error("Invalid login response");
      }

      logger.info("Login successful", { email: data.email, userId: result.data.user.id }, "AuthService");
      return result.data;
    } catch (error) {
      logger.error("Login failed", error, "AuthService");
      throw error;
    }
  }

  /**
   * Register new user - uses internal API route that handles cookies
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      logger.info("Registration attempt", { email: data.email }, "AuthService");
      
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        "/auth/register",
        data
      );

      // The interceptor returns response.data, so 'response' is already ApiResponse<AuthResponse>
      const result = response as unknown as ApiResponse<AuthResponse>;
      
      if (!result.success || !result.data) {
        logger.error("Invalid registration response", { email: data.email }, "AuthService");
        throw new Error("Invalid registration response");
      }

      logger.info("Registration successful", { email: data.email, userId: result.data.user.id }, "AuthService");
      return result.data;
    } catch (error) {
      logger.error("Registration failed", error, "AuthService");
      throw error;
    }
  }

  /**
   * Logout user - uses internal API route that clears cookies
   */
  async logout(): Promise<void> {
    try {
      logger.info("Logout attempt", undefined, "AuthService");
      await apiClient.post("/auth/logout");
      logger.info("Logout successful", undefined, "AuthService");
    } catch (error) {
      logger.error("Logout failed", error, "AuthService");
      throw error;
    }
  }

  /**
   * Get current user profile - uses internal API route that reads cookies
   */
  async getProfile(): Promise<IUserPublic> {
    try {
      logger.debug("Fetching user profile", undefined, "AuthService");
      
      // For server-side requests, we need to include auth headers
      const headers = await getServerAuthHeaders();

      const response = await apiClient.get<ApiResponse<{ user: IUserPublic }>>(
        "/auth/profile",
        { headers }
      );

      // The interceptor returns response.data, so 'response' is already ApiResponse
      const result = response as unknown as ApiResponse<{ user: IUserPublic }>;

      if (!result.success || !result.data) {
        logger.error("Invalid profile response", result, "AuthService");
        throw new Error("Invalid profile response");
      }

      logger.debug("Profile fetched successfully", { userId: result.data.user.id }, "AuthService");
      return result.data.user;
    } catch (error) {
      logger.error("Failed to fetch profile", error, "AuthService");
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      logger.info("Password reset requested", { email }, "AuthService");
      await apiClient.post("/auth/request-password-reset", { email });
      logger.info("Password reset email sent", { email }, "AuthService");
    } catch (error) {
      logger.error("Failed to request password reset", error, "AuthService");
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      logger.info("Password reset attempt", { tokenLength: token.length }, "AuthService");
      await apiClient.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      logger.info("Password reset successful", undefined, "AuthService");
    } catch (error) {
      logger.error("Failed to reset password", error, "AuthService");
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      logger.info("Verification email resend requested", { email }, "AuthService");
      await apiClient.post("/auth/resend-verification", { email });
      logger.info("Verification email resent", { email }, "AuthService");
    } catch (error) {
      logger.error("Failed to resend verification email", error, "AuthService");
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      logger.info("Email verification attempt", { tokenLength: token.length }, "AuthService");
      await apiClient.post("/auth/verify-email", { token });
      logger.info("Email verified successfully", undefined, "AuthService");
    } catch (error) {
      logger.error("Failed to verify email", error, "AuthService");
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;
