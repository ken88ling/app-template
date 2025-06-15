import { apiClient, getServerAuthHeaders } from "./apiClient";
import { 
  IUserPublic, 
  ApiResponse, 
  PaginationParams, 
  PaginatedResponse,
  UpdateProfileData,
  ProfilePhotoResponse
} from "@app/shared-types";
import logger from "@/utils/logger";

class UserService {
  /**
   * Get current user profile
   */
  async getMyProfile(): Promise<IUserPublic> {
    try {
      logger.debug("Fetching current user profile", undefined, "UserService");
      
      const headers = await getServerAuthHeaders();
      const response = await apiClient.get<ApiResponse<IUserPublic>>(
        "/users/my-profile",
        { headers }
      );
      
      // The interceptor returns response.data, so 'response' is already ApiResponse
      const result = response as unknown as ApiResponse<IUserPublic>;
      
      if (!result.success || !result.data) {
        logger.error("Invalid profile response", result, "UserService");
        throw new Error("Invalid profile response");
      }
      
      logger.debug("User profile fetched", { userId: result.data.id }, "UserService");
      return result.data;
    } catch (error) {
      logger.error("Failed to fetch user profile", error, "UserService");
      throw error;
    }
  }

  /**
   * Update current user profile
   */
  async updateMyProfile(data: UpdateProfileData): Promise<IUserPublic> {
    try {
      logger.info("Updating user profile", { fields: Object.keys(data) }, "UserService");
      
      const headers = await getServerAuthHeaders();
      const response = await apiClient.put<ApiResponse<IUserPublic>>(
        "/users/my-profile",
        data,
        { headers }
      );
      
      // The interceptor returns response.data, so 'response' is already ApiResponse
      const result = response as unknown as ApiResponse<IUserPublic>;
      
      if (!result.success || !result.data) {
        logger.error("Invalid update response", result, "UserService");
        throw new Error("Invalid update response");
      }
      
      logger.info("User profile updated", { userId: result.data.id, fields: Object.keys(data) }, "UserService");
      return result.data;
    } catch (error) {
      logger.error("Failed to update user profile", error, "UserService");
      throw error;
    }
  }

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(file: File): Promise<ProfilePhotoResponse> {
    try {
      logger.info("Uploading profile photo", { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type 
      }, "UserService");
      
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
        logger.error("Failed to upload photo", result, "UserService");
        throw new Error("Failed to upload photo");
      }

      logger.info("Profile photo uploaded", { photoUrl: result.data.url }, "UserService");
      return result.data;
    } catch (error) {
      logger.error("Failed to upload profile photo", error, "UserService");
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      logger.info("Password change attempt", undefined, "UserService");
      
      const headers = await getServerAuthHeaders();
      await apiClient.post(
        "/users/change-password",
        {
          currentPassword,
          newPassword,
        },
        { headers }
      );
      
      logger.info("Password changed successfully", undefined, "UserService");
    } catch (error) {
      logger.error("Failed to change password", error, "UserService");
      throw error;
    }
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<IUserPublic> {
    try {
      logger.debug("Fetching user by ID", { userId }, "UserService");
      
      const headers = await getServerAuthHeaders();
      const response = await apiClient.get<ApiResponse<IUserPublic>>(
        `/users/${userId}`,
        { headers }
      );
      
      // The interceptor returns response.data, so 'response' is already ApiResponse
      const result = response as unknown as ApiResponse<IUserPublic>;
      
      if (!result.success || !result.data) {
        logger.error("Invalid user response", { userId, result }, "UserService");
        throw new Error("Invalid user response");
      }
      
      logger.debug("User fetched by ID", { userId, userEmail: result.data.email }, "UserService");
      return result.data;
    } catch (error) {
      logger.error("Failed to fetch user by ID", { userId, error }, "UserService");
      throw error;
    }
  }

  /**
   * List users (admin only)
   */
  async listUsers(params?: PaginationParams & {
    search?: string;
    role?: string;
    status?: string;
  }): Promise<PaginatedResponse<IUserPublic>> {
    try {
      logger.debug("Listing users", params, "UserService");
      
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
        logger.error("Invalid users list response", result, "UserService");
        throw new Error("Invalid users list response");
      }

      logger.debug("Users listed", { 
        count: result.data.data.length, 
        total: result.data.pagination.total,
        page: result.data.pagination.page 
      }, "UserService");
      
      return result.data;
    } catch (error) {
      logger.error("Failed to list users", { params, error }, "UserService");
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;