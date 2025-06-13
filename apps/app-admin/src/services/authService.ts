import { internalApi } from './api';
import { LoginRequest, IUserPublic, ApiResponse } from '@app/shared-types';

// Alias for compatibility
export type LoginData = LoginRequest;
export interface User extends IUserPublic {
  phone?: string;
  employeeId?: string;
  department?: string;
}

export interface AuthResponse {
  user: User;
  company?: {
    id: string;
    name: string;
    code: string;
  };
}

class AuthService {
  /**
   * Admin login - uses internal API route that handles cookies
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await internalApi.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      data
    );
    if (!response.data) {
      throw new Error('Login failed: No data received');
    }
    return response.data;
  }

  /**
   * Logout admin - uses internal API route that clears cookies
   */
  async logout(): Promise<void> {
    await internalApi.post('/auth/logout');
  }

  /**
   * Get current admin profile - uses internal API route that reads cookies
   */
  async getProfile(): Promise<User> {
    const response =
      await internalApi.get<ApiResponse<{ user: User }>>('/auth/profile');
    if (!response.data) {
      throw new Error('Failed to get profile: No data received');
    }
    return response.data.user;
  }
}

const authService = new AuthService();
export default authService;
