# Authentication Architecture

This document explains the authentication architecture used across the app template, including the unified API approach with Axios.

## Overview

The authentication system uses a secure, unified architecture that works seamlessly across server-side rendering (SSR) and client-side rendering:

```
Browser → Next.js API Routes → Backend API
   ↓            ↓                    ↓
Cookies    Acts as Proxy      Actual Logic
(HTTP-only)  (Security Layer)   (Protected)
```

## Benefits

1. **Security**: Backend API URL hidden from browser, only Next.js server knows it
2. **Cookie Management**: HTTP-only cookies never exposed to client JavaScript
3. **SSR Support**: Server components can make authenticated requests
4. **CORS-free**: No CORS issues since browser only talks to same origin
5. **Unified Interface**: Single API client for both server and client contexts

## Implementation

### 1. Unified API Client

```typescript
// services/api.ts - Single Axios instance
import axios from 'axios';
import { cookies } from 'next/headers';

const isServer = typeof window === 'undefined';

// Create different configs for server vs client
const createApiClient = () => {
  if (isServer) {
    // Server-side: Call backend directly
    return axios.create({
      baseURL: process.env.BACKEND_URL || 'http://localhost:4000/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } else {
    // Client-side: Call Next.js API routes
    return axios.create({
      baseURL: '/api',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const apiClient = createApiClient();

// Server-side helper to forward cookies
export const getServerHeaders = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken');
  
  return {
    ...(accessToken && { Authorization: `Bearer ${accessToken.value}` }),
  };
};

// Interceptors for consistent error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (axios.isAxiosError(error)) {
      const customError = {
        message: error.response?.data?.error?.message || 'An error occurred',
        status: error.response?.status || 500,
        code: error.response?.data?.error?.code,
      };
      throw customError;
    }
    throw error;
  }
);
```

### 2. Service Layer

Services provide a clean interface for authentication operations:

```typescript
// services/authService.ts
import { apiClient, getServerHeaders, isServer } from './api';
import { LoginRequest, WebAuthResponse, ApiResponse } from '@app/shared-types';

class AuthService {
  async login(data: LoginRequest): Promise<WebAuthResponse> {
    // Client-side: calls /api/auth/login (Next.js route)
    // Server-side: calls backend directly
    const endpoint = isServer ? '/auth/login' : '/auth/login';
    const response = await apiClient.post<ApiResponse<WebAuthResponse>>(endpoint, data);
    return response.data;
  }

  async getProfile(): Promise<User> {
    if (isServer) {
      // Server-side: include auth headers
      const headers = await getServerHeaders();
      const response = await apiClient.get<ApiResponse<User>>('/auth/profile', { headers });
      return response.data;
    } else {
      // Client-side: cookies sent automatically
      const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
      return response.data;
    }
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  async register(data: RegisterRequest): Promise<WebAuthResponse> {
    const response = await apiClient.post<ApiResponse<WebAuthResponse>>('/auth/register', data);
    return response.data;
  }

  async refreshToken(): Promise<void> {
    await apiClient.post('/auth/refresh');
  }
}

export default new AuthService();
```

### 3. Next.js API Routes

API routes act as a secure proxy between the client and backend:

```typescript
// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { apiClient } from '@/services/api';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Call backend
    const response = await apiClient.post('/auth/login', body);
    const { user, accessToken, refreshToken } = response.data;
    
    // Set HTTP-only cookies
    const cookieStore = await cookies();
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });
    
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    // Return only user data (no tokens to client)
    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    // Consistent error handling
    return NextResponse.json(
      { error: { message: error.message } },
      { status: error.status || 500 }
    );
  }
}
```

### 4. Auth Context

The auth context manages authentication state across the application:

```typescript
// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '@/services/authService';
import { IUserPublic } from '@app/shared-types';

interface AuthContextType {
  user: IUserPublic | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const userProfile = await authService.getProfile();
      setUser(userProfile);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshAuth = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Usage Examples

### Client Component

```typescript
'use client';
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Success - context handles state update
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };
}
```

### Server Component

```typescript
import authService from '@/services/authService';
import { redirect } from 'next/navigation';

async function ProfilePage() {
  try {
    const user = await authService.getProfile();
    return <div>Welcome {user.firstName}</div>;
  } catch (error) {
    redirect('/login');
  }
}
```

### Protected Route Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  
  if (!accessToken && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## Security Considerations

1. **HTTP-only Cookies**: Tokens stored in HTTP-only cookies, preventing XSS attacks
2. **CSRF Protection**: SameSite cookie attribute prevents CSRF attacks
3. **Token Rotation**: Refresh tokens allow for short-lived access tokens
4. **Backend Isolation**: Backend API URL never exposed to client
5. **Type Safety**: Full TypeScript coverage with shared types

## Error Handling

The unified approach provides consistent error handling:

```typescript
try {
  const user = await authService.getProfile();
} catch (error) {
  // error has consistent shape:
  // {
  //   message: string;
  //   status: number;
  //   code?: string;
  // }
  if (error.status === 401) {
    // Handle unauthorized
  } else if (error.status === 403) {
    // Handle forbidden
  } else {
    // Handle other errors
  }
}
```

## Migration from Fetch to Axios

The migration from fetch to axios provides:

1. **Better error handling**: Automatic error throwing for non-2xx responses
2. **Request/response interceptors**: Global handling of auth tokens
3. **Automatic JSON transformation**: No need for `.json()` calls
4. **Request cancellation**: Built-in support for cancelling requests
5. **Progress monitoring**: For file uploads/downloads
6. **Better TypeScript support**: More predictable typing

## Best Practices

1. **Always use the service layer**: Don't call API routes directly
2. **Handle errors appropriately**: Show user-friendly error messages
3. **Use TypeScript**: Leverage shared types for type safety
4. **Server-first approach**: Prefer server components for authenticated data
5. **Secure by default**: Never expose tokens to client-side code