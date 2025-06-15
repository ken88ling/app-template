import { apiClient, getServerAuthHeaders } from "./apiClient";
import { 
  IUserPublic, 
  ApiResponse, 
  PaginationParams, 
  PaginatedResponse,
  UpdateProfileData,
  ProfilePhotoResponse
} from "@app/shared-types";

class UserService {
  /**
   * Get current user profile
   */
  async getMyProfile(): Promise<IUserPublic> {
    const headers = await getServerAuthHeaders();
    const response = await apiClient.get<ApiResponse<IUserPublic>>(
      "/users/my-profile",
      { headers }
    );
    
    // The interceptor returns response.data, so 'response' is already ApiResponse
    const result = response as unknown as ApiResponse<IUserPublic>;
    
    if (!result.success || !result.data) {
      throw new Error("Invalid profile response");
    }
    
    return result.data;
  }

  /**
   * Update current user profile
   */
  async updateMyProfile(data: UpdateProfileData): Promise<IUserPublic> {
    const headers = await getServerAuthHeaders();
    const response = await apiClient.put<ApiResponse<IUserPublic>>(
      "/users/my-profile",
      data,
      { headers }
    );
    
    // The interceptor returns response.data, so 'response' is already ApiResponse
    const result = response as unknown as ApiResponse<IUserPublic>;
    
    if (!result.success || !result.data) {
      throw new Error("Invalid update response");
    }
    
    return result.data;
  }

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(file: File): Promise<ProfilePhotoResponse> {
    const formData = new FormData();
    formData.append("photo", file);

    const headers = await getServerAuthHeaders();
    
    // For file uploads, we need to let axios set the content-type with boundary
    const response = await apiClient.post<ApiResponse<ProfilePhotoResponse>>(
      "/users/my-profile/photo",
      formData,
      {
        headers: {
          ...headers,
          // Let axios set the Content-Type with boundary for multipart/form-data
        },
      }
    );

    // The interceptor returns response.data, so 'response' is already ApiResponse
    const result = response as unknown as ApiResponse<ProfilePhotoResponse>;

    if (!result.success || !result.data) {
      throw new Error("Failed to upload photo");
    }

    return result.data;
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const headers = await getServerAuthHeaders();
    await apiClient.post(
      "/users/change-password",
      {
        currentPassword,
        newPassword,
      },
      { headers }
    );
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<IUserPublic> {
    const headers = await getServerAuthHeaders();
    const response = await apiClient.get<ApiResponse<IUserPublic>>(
      `/users/${userId}`,
      { headers }
    );
    
    // The interceptor returns response.data, so 'response' is already ApiResponse
    const result = response as unknown as ApiResponse<IUserPublic>;
    
    if (!result.success || !result.data) {
      throw new Error("Invalid user response");
    }
    
    return result.data;
  }

  /**
   * List users (admin only)
   */
  async listUsers(params?: PaginationParams & {
    search?: string;
    role?: string;
    status?: string;
  }): Promise<PaginatedResponse<IUserPublic>> {
    const headers = await getServerAuthHeaders();
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<IUserPublic>>>(
      "/users",
      {
        params,
        headers
      }
    );

    // The interceptor returns response.data, so 'response' is already ApiResponse
    const result = response as unknown as ApiResponse<PaginatedResponse<IUserPublic>>;

    if (!result.success || !result.data) {
      throw new Error("Invalid users list response");
    }

    return result.data;
  }
}

const userService = new UserService();
export default userService;