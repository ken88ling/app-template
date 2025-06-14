# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

App Template is a modern full-stack application template with authentication and user management, featuring three user tiers:

- **Users**: Standard users with basic access
- **Managers**: Middle-level users with management capabilities  
- **Super Admins**: Platform administrators with full system access

The template provides a solid foundation for building web and mobile applications with user authentication, profile management, and role-based access control.

## Repository Structure

- `app-be/` - Backend API (Express.js + TypeScript + Prisma)
- `app-web/` - Customer web portal (Next.js)
- `app-admin/` - Admin web portal (Next.js)
- `app-mobile/` - Mobile app (React Native/Expo)
- `packages/shared-types/` - Shared TypeScript types for all apps

## Common Development Commands

### Backend (app-be)

```bash
bun run dev              # Start dev server with hot reload
bun run prisma:migrate   # Run database migrations
bun run prisma:studio    # Open Prisma Studio GUI
bun run prisma:seed      # Seed database
bun run build           # Build TypeScript
bun run test            # Run tests
bun run lint            # Run ESLint
bun run format          # Run Prettier
```

### Web Apps (app-web, app-admin)

```bash
bun run dev             # Start Next.js dev server
bun run build           # Build for production
bun run start           # Start production server
bun run lint            # Run Next.js linting
```

### Mobile App (app-mobile)

```bash
bun run start           # Start Expo dev server
bun run android         # Run on Android
bun run ios             # Run on iOS
bun run web             # Run on web browser
bun run lint            # Run Expo linting
```

### Shared Types (packages/shared-types)

```bash
# Types are linked locally using file: protocol
# Import in any app:
import { UserRole, IUser } from '@app/shared-types';
```

## Type Sharing

All TypeScript types, interfaces, and enums are centralized in `packages/shared-types`:

```typescript
// Import shared types in any app
import { IUser, UserRole, ApiResponse } from '@app/shared-types';
```

See [packages/shared-types/README.md](packages/shared-types/README.md) for detailed usage.

## Architecture Notes

### Backend Architecture

- RESTful API built with Express.js and TypeScript
- Prisma ORM for database operations
- JWT authentication with role-based access control
- Modular structure: controllers, services, models, middleware
- API versioning (v1) in routes

### Frontend Architecture

- Next.js 15+ with App Router
- Server-side rendering and API routes
- Tailwind CSS for styling
- TypeScript for type safety

### Mobile Architecture

- Expo SDK with React Native
- Tab-based navigation
- Themed components system
- Platform-specific code handling (iOS/Android)

### Key Integration Points

- Authentication: JWT tokens shared between web and mobile
- API: All clients communicate with app-be backend using Axios
- Database: SQLite (dev)
- Shared Types: All apps use @app/shared-types for TypeScript definitions
- HTTP Client: Unified Axios implementation with automatic error handling

## Important Considerations

1. **Simple Template**: This is a clean template focused on authentication and user management fundamentals.

2. **Role-based Access**: Different features and endpoints are available based on user roles (User, Manager, Super Admin).

3. **Multi-platform**: Designed to work across web, admin portal, and mobile applications.

4. **Extensible**: Built with a modular architecture that can be extended for specific business needs.
