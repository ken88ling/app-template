import { internalApi, externalApi } from "./api";
import {
  LoginRequest,
  RegisterRequest,
  IUserPublic,
  ApiResponse,
  WebAuthResponse as AuthResponse,
} from "@app/shared-types";

class AuthService {
  /**
   * Login user - uses internal API route that handles cookies
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await internalApi.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data
    );
    
    if (!response.data) {
      throw new Error("Invalid login response");
    }
    
    return response.data;
  }

  /**
   * Register new user - uses internal API route that handles cookies
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await internalApi.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data
    );
    
    if (!response.data) {
      throw new Error("Invalid registration response");
    }
    
    return response.data;
  }

  /**
   * Logout user - uses internal API route that clears cookies
   */
  async logout(): Promise<void> {
    await internalApi.post("/auth/logout");
  }

  /**
   * Get current user profile - uses internal API route that reads cookies
   */
  async getProfile(): Promise<IUserPublic> {
    const response = await internalApi.get<ApiResponse<{ user: IUserPublic }>>(
      "/auth/profile"
    );

    if (!response.data) {
      throw new Error("Invalid profile response");
    }

    const profileData = response.data;

    // Handle different possible response structures
    if (profileData.user) {
      return profileData.user;
    } else if (
      profileData &&
      typeof profileData === "object" &&
      "id" in profileData
    ) {
      // If the user data is directly in the data field
      return profileData as unknown as IUserPublic;
    } else {
      throw new Error("Invalid user data structure");
    }
  }

  /**
   * Request password reset - goes directly to backend (no auth needed)
   */
  async forgotPassword(email: string): Promise<void> {
    await externalApi.post("/auth/forgot-password", { email });
  }

  /**
   * Reset password with token - goes directly to backend (no auth needed)
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await externalApi.post("/auth/reset-password", { token, password });
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    await externalApi.post("/auth/resend-verification", { email });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await externalApi.post(`/auth/verify-email?token=${token}`);
  }
}

const authService = new AuthService();
export default authService;
