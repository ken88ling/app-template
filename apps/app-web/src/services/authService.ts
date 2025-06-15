import { apiClient, getServerAuthHeaders } from "./apiClient";
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
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data
    );

    // The interceptor returns response.data, so 'response' is already ApiResponse<AuthResponse>
    const result = response as unknown as ApiResponse<AuthResponse>;

    if (!result.success || !result.data) {
      throw new Error("Invalid login response");
    }

    return result.data;
  }

  /**
   * Register new user - uses internal API route that handles cookies
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data
    );

    // The interceptor returns response.data, so 'response' is already ApiResponse<AuthResponse>
    const result = response as unknown as ApiResponse<AuthResponse>;
    
    if (!result.success || !result.data) {
      throw new Error("Invalid registration response");
    }

    return result.data;
  }

  /**
   * Logout user - uses internal API route that clears cookies
   */
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  }

  /**
   * Get current user profile - uses internal API route that reads cookies
   */
  async getProfile(): Promise<IUserPublic> {
    // For server-side requests, we need to include auth headers
    const headers = await getServerAuthHeaders();

    const response = await apiClient.get<ApiResponse<{ user: IUserPublic }>>(
      "/auth/profile",
      { headers }
    );

    // The interceptor returns response.data, so 'response' is already ApiResponse
    const result = response as unknown as ApiResponse<{ user: IUserPublic }>;

    if (!result.success || !result.data) {
      throw new Error("Invalid profile response");
    }

    return result.data.user;
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/request-password-reset", { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post("/auth/reset-password", {
      token,
      newPassword: password,
    });
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    await apiClient.post("/auth/resend-verification", { email });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post("/auth/verify-email", { token });
  }
}

const authService = new AuthService();
export default authService;
