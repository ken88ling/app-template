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
    
    if (!response.data) {
      throw new Error("Invalid profile response");
    }
    
    return response.data;
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
    
    if (!response.data) {
      throw new Error("Invalid update response");
    }
    
    return response.data;
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

    if (!response.data) {
      throw new Error("Failed to upload photo");
    }

    return response.data;
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
    
    if (!response.data) {
      throw new Error("Invalid user response");
    }
    
    return response.data;
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
      `/users`,
      {
        params,
        headers
      }
    );

    if (!response.data) {
      throw new Error("Invalid users list response");
    }

    return response.data;
  }
}

const userService = new UserService();
export default userService;