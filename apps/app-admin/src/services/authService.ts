import { apiClient, getServerAuthHeaders } from "./apiClient";
import { LoginRequest, IUserAdmin, ApiResponse, AdminAuthResponse } from "@app/shared-types";

// Alias for compatibility
export type LoginData = LoginRequest;
export type User = IUserAdmin;
export type AuthResponse = AdminAuthResponse;

class AuthService {
  /**
   * Admin login - uses internal API route that handles cookies
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data
    );
    if (!response.data) {
      throw new Error("Login failed: No data received");
    }
    return response.data;
  }

  /**
   * Logout admin - uses internal API route that clears cookies
   */
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  }

  /**
   * Get current admin profile - uses internal API route that reads cookies
   */
  async getProfile(): Promise<User> {
    const headers = await getServerAuthHeaders();
    const response = await apiClient.get<ApiResponse<{ user: User }>>(
      "/auth/profile",
      { headers }
    );
    if (!response.data) {
      throw new Error("Failed to get profile: No data received");
    }
    return response.data.user;
  }
}

const authService = new AuthService();
export default authService;