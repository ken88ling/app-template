import { internalApi } from "./api";
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
    const response =
      await internalApi.get<ApiResponse<IUserPublic>>("/users/my-profile");
    
    if (!response.data) {
      throw new Error("Invalid profile response");
    }
    
    return response.data;
  }

  /**
   * Update current user profile
   */
  async updateMyProfile(data: UpdateProfileData): Promise<IUserPublic> {
    const response = await internalApi.put<ApiResponse<IUserPublic>>(
      "/users/my-profile",
      data
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

    // For file uploads, we need to override the content-type
    const response = await fetch("/api/users/my-profile/photo", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to upload photo");
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await internalApi.post("/users/change-password", {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<IUserPublic> {
    const response = await internalApi.get<ApiResponse<IUserPublic>>(
      `/users/${userId}`
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
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await internalApi.get<ApiResponse<PaginatedResponse<IUserPublic>>>(
      `/users?${queryParams.toString()}`
    );

    if (!response.data) {
      throw new Error("Invalid users list response");
    }

    return response.data;
  }
}

const userService = new UserService();
export default userService;
