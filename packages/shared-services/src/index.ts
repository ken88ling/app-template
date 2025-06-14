// Export UserService and types
export { UserService } from './services/UserService';
export type { IDataSource, UserServiceOptions } from './services/UserService';

// Export data source adapters
export { PrismaDataSource } from './adapters/PrismaDataSource';
export { ApiDataSource } from './adapters/ApiDataSource';

// Re-export commonly used types from shared-types for convenience
export type {
  IUser,
  IUserPublic,
  ICreateUser,
  IUpdateUser,
} from '@app/shared-types';

// Re-export enums (these are values, not types)
export {
  UserRole,
  UserStatus,
} from '@app/shared-types';