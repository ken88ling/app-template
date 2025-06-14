import { UserRole, UserStatus } from '../enums';

export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePhoto?: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpiry?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiry?: Date | null;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePhoto: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
}

export interface IUserAdmin extends IUserPublic {
  phone?: string;
  employeeId?: string;
  department?: string;
}

export interface IUserAuth {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
}

export interface ICreateUser {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface IUpdateUser {
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

// Backward compatibility aliases
export type { ICreateUser as IUserCreate };
export type { IUpdateUser as IUserUpdate };
