# @app/shared-services

Shared services for user operations that can be used across all apps (backend, web, admin, mobile). This package provides a framework-agnostic UserService with adapters for different data sources.

## Installation

Add to your app's package.json:

```json
{
  "dependencies": {
    "@app/shared-services": "file:../../packages/shared-services"
  }
}
```

Then run:
```bash
bun install
```

## Architecture

The package follows an adapter pattern to work with different data sources:

- **UserService**: Core business logic for user operations
- **IDataSource**: Interface that adapters must implement
- **PrismaDataSource**: Adapter for backend apps using Prisma
- **ApiDataSource**: Adapter for frontend apps making API calls

## Usage Examples

### Backend (Express + Prisma)

```typescript
import { UserService, PrismaDataSource } from '@app/shared-services';
import { prisma } from './database/client';

// Create service instance
const userService = new UserService({
  dataSource: new PrismaDataSource(prisma),
  defaultRole: UserRole.USER,
  defaultStatus: UserStatus.PENDING_VERIFICATION,
});

// Use in controllers
export async function createUser(req: Request, res: Response) {
  try {
    const user = await userService.createUser({
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      role: req.body.role, // Optional, defaults to USER
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
```

### Frontend (Next.js / React)

```typescript
import { UserService, ApiDataSource } from '@app/shared-services';

// Create service instance
const userService = new UserService({
  dataSource: new ApiDataSource(
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    () => localStorage.getItem('authToken') // Token getter function
  ),
});

// Use in components or API routes
async function handleCreateUser(userData: ICreateUser) {
  try {
    const user = await userService.createUser(userData);
    console.log('User created:', user);
  } catch (error) {
    console.error('Failed to create user:', error);
  }
}
```

### Mobile (React Native / Expo)

```typescript
import { UserService, ApiDataSource } from '@app/shared-services';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create service instance
const userService = new UserService({
  dataSource: new ApiDataSource(
    'https://api.yourapp.com',
    async () => await AsyncStorage.getItem('authToken')
  ),
});

// Use in screens
const ProfileScreen = () => {
  const [user, setUser] = useState<IUserPublic | null>(null);

  useEffect(() => {
    async function loadUser() {
      const userData = await userService.getUserById(userId);
      setUser(userData);
    }
    loadUser();
  }, [userId]);

  // ... render user profile
};
```

## API Reference

### UserService Methods

#### createUser(data)
Creates a new user with optional role assignment.

```typescript
const user = await userService.createUser({
  email: 'user@example.com',
  password: 'securepassword',
  firstName: 'John',
  lastName: 'Doe',
  role: UserRole.USER, // Optional
});
```

#### getUserById(id)
Retrieves a user by their ID.

```typescript
const user = await userService.getUserById('user-id-123');
```

#### updateUser(id, data, requestingUserId?, requestingUserRole?)
Updates user information with authorization checks.

```typescript
const updatedUser = await userService.updateUser(
  'user-id-123',
  { firstName: 'Jane', lastName: 'Smith' },
  'requesting-user-id',
  UserRole.SUPER_ADMIN
);
```

#### deleteUser(id, requestingUserId?, requestingUserRole?)
Deletes a user with authorization checks.

```typescript
await userService.deleteUser(
  'user-id-123',
  'requesting-user-id',
  UserRole.SUPER_ADMIN
);
```

#### getUsersByRole(role, requestingUserRole?)
Retrieves all users with a specific role.

```typescript
const managers = await userService.getUsersByRole(
  UserRole.MANAGER,
  UserRole.SUPER_ADMIN
);
```

## Authorization Rules

The UserService includes built-in authorization checks:

- **Self-modification**: Users can update their own profiles
- **Manager permissions**: Can modify users (but not other managers or super admins)
- **Super Admin permissions**: Can modify and delete any user
- **Role-based listing**: Only managers and super admins can list users by role

## Creating Custom Data Sources

You can create custom data sources by implementing the `IDataSource` interface:

```typescript
import { IDataSource } from '@app/shared-services';

class CustomDataSource implements IDataSource {
  async createUser(data: ICreateUser & { role?: UserRole }): Promise<IUser> {
    // Your implementation
  }

  async getUserById(id: string): Promise<IUser | null> {
    // Your implementation
  }

  async updateUser(id: string, data: IUpdateUser): Promise<IUser> {
    // Your implementation
  }

  async deleteUser(id: string): Promise<void> {
    // Your implementation
  }

  async getUsersByRole(role: UserRole): Promise<IUser[]> {
    // Your implementation
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    // Your implementation
  }
}
```

## Error Handling

All methods throw errors with descriptive messages:

- Invalid email format
- User already exists
- User not found
- Unauthorized access
- Email already in use

Handle errors appropriately in your application:

```typescript
try {
  const user = await userService.createUser(userData);
} catch (error) {
  if (error.message === 'User with this email already exists') {
    // Handle duplicate email
  } else {
    // Handle other errors
  }
}
```

## TypeScript Support

This package is written in TypeScript and exports all necessary types:

```typescript
import {
  UserService,
  IDataSource,
  UserServiceOptions,
  IUser,
  IUserPublic,
  ICreateUser,
  IUpdateUser,
  UserRole,
  UserStatus,
} from '@app/shared-services';
```

## Development

```bash
# Build the package
bun run build

# Watch mode for development
bun run dev

# Clean build artifacts
bun run clean
```