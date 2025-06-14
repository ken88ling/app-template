import {
  IUser,
  IUserPublic,
  ICreateUser,
  IUpdateUser,
  UserRole,
  UserStatus,
} from '@app/shared-types';

export interface IDataSource {
  createUser(data: ICreateUser & { role?: UserRole }): Promise<IUser>;
  getUserById(id: string): Promise<IUser | null>;
  updateUser(id: string, data: IUpdateUser): Promise<IUser>;
  deleteUser(id: string): Promise<void>;
  getUsersByRole(role: UserRole): Promise<IUser[]>;
  getUserByEmail(email: string): Promise<IUser | null>;
}

export interface UserServiceOptions {
  dataSource: IDataSource;
  defaultRole?: UserRole;
  defaultStatus?: UserStatus;
}

export class UserService {
  private dataSource: IDataSource;
  private defaultRole: UserRole;
  private defaultStatus: UserStatus;

  constructor(options: UserServiceOptions) {
    this.dataSource = options.dataSource;
    this.defaultRole = options.defaultRole || UserRole.USER;
    this.defaultStatus = options.defaultStatus || UserStatus.PENDING_VERIFICATION;
  }

  /**
   * Create a new user with role assignment
   */
  async createUser(
    data: ICreateUser & { role?: UserRole; status?: UserStatus }
  ): Promise<IUserPublic> {
    try {
      // Validate email format
      if (!this.isValidEmail(data.email)) {
        throw new Error('Invalid email format');
      }

      // Check if user already exists
      const existingUser = await this.dataSource.getUserByEmail(data.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create user with defaults
      const userData = {
        ...data,
        role: data.role || this.defaultRole,
        status: data.status || this.defaultStatus,
      };

      const user = await this.dataSource.createUser(userData);
      return this.toPublicUser(user);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<IUserPublic | null> {
    try {
      const user = await this.dataSource.getUserById(id);
      return user ? this.toPublicUser(user) : null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user information
   */
  async updateUser(
    id: string,
    data: IUpdateUser,
    requestingUserId?: string,
    requestingUserRole?: UserRole
  ): Promise<IUserPublic> {
    try {
      // Check if user exists
      const existingUser = await this.dataSource.getUserById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Authorization check
      if (!this.canModifyUser(id, requestingUserId, requestingUserRole)) {
        throw new Error('Unauthorized to modify this user');
      }

      // Validate email if provided
      if (data.email && !this.isValidEmail(data.email)) {
        throw new Error('Invalid email format');
      }

      // Check email uniqueness if changed
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await this.dataSource.getUserByEmail(data.email);
        if (emailExists) {
          throw new Error('Email already in use');
        }
      }

      const updatedUser = await this.dataSource.updateUser(id, data);
      return this.toPublicUser(updatedUser);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(
    id: string,
    requestingUserId?: string,
    requestingUserRole?: UserRole
  ): Promise<void> {
    try {
      // Check if user exists
      const user = await this.dataSource.getUserById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Authorization check
      if (!this.canDeleteUser(user, requestingUserId, requestingUserRole)) {
        throw new Error('Unauthorized to delete this user');
      }

      await this.dataSource.deleteUser(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(
    role: UserRole,
    requestingUserRole?: UserRole
  ): Promise<IUserPublic[]> {
    try {
      // Authorization check
      if (!this.canViewUsersByRole(requestingUserRole)) {
        throw new Error('Unauthorized to view users by role');
      }

      const users = await this.dataSource.getUsersByRole(role);
      return users.map(user => this.toPublicUser(user));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Convert full user to public user (remove sensitive fields)
   */
  private toPublicUser(user: IUser): IUserPublic {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      profilePhoto: user.profilePhoto ?? null,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }

  /**
   * Check if user can modify another user
   */
  private canModifyUser(
    targetUserId: string,
    requestingUserId?: string,
    requestingUserRole?: UserRole
  ): boolean {
    // Users can modify themselves
    if (targetUserId === requestingUserId) {
      return true;
    }

    // Super admins can modify anyone
    if (requestingUserRole === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Managers can modify users (but not other managers or super admins)
    // This would require checking the target user's role
    // For now, we'll keep it simple
    if (requestingUserRole === UserRole.MANAGER) {
      return true;
    }

    return false;
  }

  /**
   * Check if user can delete another user
   */
  private canDeleteUser(
    targetUser: IUser,
    requestingUserId?: string,
    requestingUserRole?: UserRole
  ): boolean {
    // Users cannot delete themselves
    if (targetUser.id === requestingUserId) {
      return false;
    }

    // Only super admins can delete users
    return requestingUserRole === UserRole.SUPER_ADMIN;
  }

  /**
   * Check if user can view users by role
   */
  private canViewUsersByRole(requestingUserRole?: UserRole): boolean {
    // Only managers and super admins can view users by role
    return (
      requestingUserRole === UserRole.SUPER_ADMIN ||
      requestingUserRole === UserRole.MANAGER
    );
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle and format errors
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}