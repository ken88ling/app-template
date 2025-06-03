import { IDataSource } from '../services/UserService';
import {
  IUser,
  ICreateUser,
  IUpdateUser,
  UserRole,
} from '@app/shared-types';

/**
 * API data source adapter for frontend usage
 * This adapter makes HTTP requests to the backend API
 */
export class ApiDataSource implements IDataSource {
  private baseUrl: string;
  private getAuthToken?: () => string | null;

  constructor(baseUrl: string, getAuthToken?: () => string | null) {
    this.baseUrl = baseUrl;
    this.getAuthToken = getAuthToken;
  }

  private async fetch(url: string, options?: RequestInit): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };

    // Add auth token if available
    if (this.getAuthToken) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error((errorData as any).message || `HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async createUser(data: ICreateUser & { role?: UserRole }): Promise<IUser> {
    const response = await this.fetch('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    const result = await response.json() as { data: IUser };
    return result.data;
  }

  async getUserById(id: string): Promise<IUser | null> {
    try {
      const response = await this.fetch(`/api/v1/users/${id}`);
      const result = await response.json() as { data: IUser };
      return result.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async updateUser(id: string, data: IUpdateUser): Promise<IUser> {
    const response = await this.fetch(`/api/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    const result = await response.json() as { data: IUser };
    return result.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.fetch(`/api/v1/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUsersByRole(role: UserRole): Promise<IUser[]> {
    const response = await this.fetch(`/api/v1/users?role=${role}`);
    const result = await response.json() as { data: IUser[] };
    return result.data;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      const response = await this.fetch(`/api/v1/users/by-email/${encodeURIComponent(email)}`);
      const result = await response.json() as { data: IUser };
      return result.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }
}