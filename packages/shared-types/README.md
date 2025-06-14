# @app/shared-types

Shared TypeScript types, interfaces, and enums for the app template. This package ensures type consistency across all applications (backend, web, admin, and mobile).

## 📦 Installation

This package is linked to all projects using the `file:` protocol. It's already configured in each app's `package.json`:

```json
{
  "dependencies": {
    "@app/shared-types": "file:../packages/shared-types"
  }
}
```

## 🚀 Usage

Import types, interfaces, and enums directly from the package:

```typescript
import {
  IUser,
  IUserPublic,
  IUserAdmin,
  UserRole,
  UserStatus,
  ApiResponse,
  LoginRequest,
  WebAuthResponse,
  AdminAuthResponse,
} from "@app/shared-types";

// Using interfaces
const user: IUser = {
  id: "123",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Using admin-specific types
const adminUser: IUserAdmin = {
  ...user,
  phone: "+1234567890",
  employeeId: "EMP001",
  department: "Engineering",
};

// Using authentication responses
const webAuth: WebAuthResponse = {
  user: user as IUserPublic,
  company: {
    id: "comp123",
    name: "Tech Corp",
    code: "TC001",
  },
};

// Using API responses
const response: ApiResponse<IUser> = {
  success: true,
  data: user,
  message: "User fetched successfully",
};

// Using enums
if (user.role === UserRole.MANAGER) {
  // Manager-specific logic
}
```

## 📁 Structure

```
src/
├── enums/          # All enumeration types
│   └── index.ts    # UserRole, UserStatus, ErrorCode, HttpStatus
├── models/         # Domain model interfaces
│   └── user.ts     # IUser, IUserPublic, IUserAdmin, ICreateUser, etc.
├── types/          # Request/Response and utility types
│   ├── auth.ts     # LoginRequest, AuthResponse, WebAuthResponse, AdminAuthResponse
│   ├── common.ts   # ApiResponse, PaginationParams, ErrorResponse
│   └── user.ts     # UpdateProfileData, ProfilePhotoResponse
└── index.ts        # Main export file
```

## ➕ Adding New Types

### 1. Adding a New Enum

Edit `src/enums/index.ts`:

```typescript
export enum PostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}
```

### 2. Adding a New Model Interface

Create a new file or add to existing model file:

```typescript
// src/models/post.ts
import { PostStatus } from "../enums";

export interface IPost {
  id: string;
  title: string;
  content: string;
  status: PostStatus;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePost {
  title: string;
  content: string;
  authorId: string;
}

export interface IUpdatePost {
  title?: string;
  content?: string;
  status?: PostStatus;
}
```

Don't forget to export from `src/index.ts`:

```typescript
export * from "./models/post";
```

### 3. Adding Request/Response Types

Add to appropriate file in `src/types/`:

```typescript
// src/types/post.ts
export interface PostSearchRequest {
  query?: string;
  authorId?: string;
  status?: PostStatus;
  page?: number;
  limit?: number;
}
```

## 🔄 Updating Types

When you modify types:

1. Make changes in the appropriate file
2. The changes are immediately available to all linked projects
3. TypeScript will show errors in consuming projects if breaking changes are made

## 📝 Best Practices

1. **Keep types simple and focused** - Each interface should have a single responsibility
2. **Use meaningful names** - Prefix interfaces with 'I', types with descriptive names
3. **Document complex types** - Add JSDoc comments for complex properties
4. **Avoid circular dependencies** - Structure imports carefully
5. **Version breaking changes** - Consider impact on all consuming projects

## 🎆 Recent Updates

### Type Centralization (Latest)

All types have been centralized in this package to ensure consistency across applications:

1. **Admin-specific types**:
   - `IUserAdmin` - Extends IUserPublic with admin fields (phone, employeeId, department)
   - `AdminAuthResponse` - Authentication response for admin portal

2. **Web-specific types**:
   - `WebAuthResponse` - Authentication response for web applications
   - `UpdateProfileData` - User profile update fields
   - `ProfilePhotoResponse` - Profile photo upload response

3. **Common types**:
   - All authentication types (LoginRequest, RegisterRequest, etc.)
   - API response types (ApiResponse, ErrorResponse)
   - Pagination types (PaginationParams, PaginatedResponse)

## 🧪 Examples

### Example 1: Using in Express Controllers

```typescript
import { Request, Response } from "express";
import { IUser, ApiResponse, ICreateUser } from "@app/shared-types";

export const createUser = async (
  req: Request<{}, {}, ICreateUser>,
  res: Response<ApiResponse<IUser>>
) => {
  try {
    const user = await userService.create(req.body);
    res.json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: "USER_CREATION_FAILED",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
};
```

### Example 2: Using in React Components

```typescript
import React, { useState, useEffect } from "react";
import { IUser, UserRole, ApiResponse } from "@app/shared-types";
import { userApi } from "../services/api";

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const response: ApiResponse<IUser> = await userApi.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>
        {user.firstName} {user.lastName}
      </h1>
      <p>Role: {user.role}</p>
      {user.role === UserRole.MANAGER && (
        <button>Access Manager Dashboard</button>
      )}
    </div>
  );
};
```

### Example 3: Using in React Native

```typescript
import React from "react";
import { View, Text } from "react-native";
import { IUser, UserStatus } from "@app/shared-types";

interface UserCardProps {
  user: IUser;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return "#10B981";
      case UserStatus.INACTIVE:
        return "#6B7280";
      case UserStatus.SUSPENDED:
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  return (
    <View style={{ padding: 16, backgroundColor: "white" }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        {user.firstName} {user.lastName}
      </Text>
      <Text style={{ color: getStatusColor(user.status) }}>{user.status}</Text>
    </View>
  );
};
```

## 🐛 Troubleshooting

### Types not updating?

- Make sure you've saved the file in shared-types
- Try restarting your TypeScript server:
  - VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

### Import errors?

- Ensure the package is linked: check `"@app/shared-types": "file:../packages/shared-types"` in your package.json
- Run `bun install` in your app directory

### Type conflicts?

- Check for duplicate type definitions in your project
- Ensure you're importing from `@app/shared-types`, not local files

## 🤝 Contributing

When adding or modifying types:

1. Consider the impact on all consuming applications
2. Add JSDoc comments for complex types
3. Update this README if adding new categories of types
4. Test the changes in at least one consuming application

---

For more information about the app template structure, see the main [CLAUDE.md](../../CLAUDE.md) file.