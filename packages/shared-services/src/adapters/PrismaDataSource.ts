import { IDataSource } from '../services/UserService';
import {
  IUser,
  ICreateUser,
  IUpdateUser,
  UserRole,
} from '@app/shared-types';

/**
 * Prisma data source adapter for backend usage
 * This adapter expects a Prisma client instance to be passed in
 */
export class PrismaDataSource implements IDataSource {
  private prisma: any; // Type will be provided by the consuming app

  constructor(prismaClient: any) {
    this.prisma = prismaClient;
  }

  async createUser(data: ICreateUser & { role?: UserRole }): Promise<IUser> {
    return await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
    });
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUser(id: string, data: IUpdateUser): Promise<IUser> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async getUsersByRole(role: UserRole): Promise<IUser[]> {
    return await this.prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }
}