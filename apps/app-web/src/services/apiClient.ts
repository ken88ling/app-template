import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiResponse } from "@app/shared-types";
import logger from "@/utils/logger";

// Check if we're on the server
const isServer = typeof window === "undefined";

// Create axios instance with different configs for server/client
const createApiClient = (): AxiosInstance => {
  if (isServer) {
    // Server-side: Call backend directly
    return axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  } else {
    // Client-side: Call Next.js API routes
    return axios.create({
      baseURL: "/api",
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  }
};

// Create the API client
export const apiClient = createApiClient();

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    const logData = {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      params: config.params,
      // Don't log sensitive headers
      headers: {
        "Content-Type": config.headers["Content-Type"],
        "Authorization": config.headers.Authorization ? "[REDACTED]" : undefined,
      },
    };

    logger.debug("API Request", logData, "APIClient");
    return config;
  },
  (error) => {
    logger.error("API Request Error", error, "APIClient");
    return Promise.reject(error);
  }
);

// Helper function to get auth headers for server-side requests
export const getServerAuthHeaders = async (): Promise<Record<string, string>> => {
  if (!isServer) return {};
  
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");
    
    return accessToken ? { Authorization: `Bearer ${accessToken.value}` } : {};
  } catch {
    return {};
  }
};

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    const logData = {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
    };
    
    logger.debug("API Response", logData, "APIClient");
    
    // Return the data directly (unwrap the response)
    return response.data;
  },
  (error: AxiosError<ApiResponse>) => {
    const errorDetails: Record<string, unknown> = {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      message: error.message,
    };

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorDetails.status = error.response.status;
      errorDetails.statusText = error.response.statusText;
      errorDetails.data = error.response.data;
      
      logger.error("API Response Error", errorDetails, "APIClient");
      
      const customError = {
        message: error.response.data?.error?.message || "An error occurred",
        status: error.response.status,
        code: error.response.data?.error?.code,
      };
      return Promise.reject(customError);
    } else if (error.request) {
      // The request was made but no response was received
      errorDetails.code = "NETWORK_ERROR";
      errorDetails.request = {
        method: error.request.method,
        url: error.request.url,
      };
      
      logger.error("API Network Error", errorDetails, "APIClient");
      
      return Promise.reject({
        message: "No response from server",
        status: 0,
        code: "NETWORK_ERROR",
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      errorDetails.code = "REQUEST_ERROR";
      
      logger.error("API Request Setup Error", errorDetails, "APIClient");
      
      return Promise.reject({
        message: error.message || "Request failed",
        status: 0,
        code: "REQUEST_ERROR",
      });
    }
  }
);

// Export axios for type imports
export { AxiosError } from "axios";