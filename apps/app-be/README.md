# Backend API Template

A modern, scalable backend API template built with Node.js, Express, TypeScript, and Prisma. This template provides a solid foundation for building RESTful APIs with authentication, user management, and email functionality.

## Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Email verification
  - Password reset functionality
  - Role-based access control (SUPER_ADMIN, MANAGER, USER)
  - Rate limiting for security
  - Strong password policies

- **User Management**
  - User registration and login
  - Profile management
  - User CRUD operations
  - Audit logging

- **Email Service**
  - Email verification
  - Password reset emails
  - Configurable SMTP settings

- **Database**
  - Prisma ORM with SQLite (easily switchable to PostgreSQL, MySQL, etc.)
  - Database migrations
  - Type-safe database queries
  - Seed data for development

- **API Documentation**
  - Swagger/OpenAPI documentation
  - Interactive API testing interface

- **Security & Performance**
  - Password hashing with bcrypt
  - Hashed refresh tokens
  - Input validation with express-validator
  - Error handling middleware
  - CORS configuration
  - Rate limiting middleware
  - Structured logging with Winston
  - Redis caching for authentication

- **Testing**
  - Jest test framework
  - Unit and integration tests
  - Test coverage reporting

- **Development Tools**
  - Docker Compose for Redis
  - Environment variable validation
  - Comprehensive error handling

## Tech Stack

- **Runtime**: Node.js with Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Cache**: Redis (optional)
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer
- **Validation**: express-validator
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Containerization**: Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Docker (for Redis, optional)
- SQLite (included by default)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd app-be
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL="file:./dev.db"

# JWT (Generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Optional - for email functionality)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@app.com

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
```

4. Start Redis (optional but recommended):
```bash
# Start Redis using Docker
bun run docker:start
# Or manually: docker-compose up -d
```

5. Generate Prisma client:
```bash
bun prisma generate
# or
npx prisma generate
```

6. Run database migrations:
```bash
bun prisma migrate dev
# or
npx prisma migrate dev
```

7. Seed the database (optional):
```bash
bun run prisma:seed
# or
npm run prisma:seed
```

8. Start the development server:
```bash
bun dev
# or
npm run dev
```

The API will be available at `http://localhost:4000`

## Docker Services

### Redis Cache

Start Redis with Docker Compose:

```bash
# Start Redis only
bun run docker:start

# Start all development services (Redis + PostgreSQL + GUIs)
bun run docker:start-all

# Check service status
bun run docker:status

# View logs
bun run docker:logs

# Stop services
bun run docker:stop
```

**Available Services:**
- **Redis**: `localhost:6379` (caching)
- **Redis Commander**: `http://localhost:8081` (Redis GUI)
- **PostgreSQL**: `localhost:5432` (optional database)
- **pgAdmin**: `http://localhost:8082` (PostgreSQL GUI)

See [DOCKER.md](./DOCKER.md) for detailed Docker usage instructions.

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
bun prisma generate

# Create a new migration
bun prisma migrate dev --name <migration_name>

# Apply pending migrations in production
bun prisma migrate deploy

# Reset database (drops all data!)
bun prisma migrate reset

# Open Prisma Studio (GUI for database)
bun prisma studio

# Seed the database
bun run prisma:seed
```

### Migration Workflow

1. **Modify schema**: Edit `prisma/schema.prisma`
2. **Create migration**: `bun prisma migrate dev --name add_user_field`
3. **Generate client**: Automatically happens after migration
4. **Update code**: Use the new fields in your TypeScript code

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run unit tests only
bun run test:unit

# Run integration tests only
bun run test:integration

# Run tests with coverage
bun run test:coverage

# Run tests in watch mode
bun run test:watch
```

### Test Structure

- **Unit Tests**: `src/__tests__/unit/` - Test individual functions and utilities
- **Integration Tests**: `src/__tests__/integration/` - Test API endpoints
- **Setup**: `src/__tests__/setup.ts` - Test configuration and mocks

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:4000/api-docs
```

## Project Structure

```
src/
├── app.ts                    # Express app configuration
├── server.ts                 # Server entry point
├── config/                   # Configuration files
│   ├── env.ts               # Environment validation
│   ├── jwt.ts               # JWT configuration
│   └── swagger.ts           # Swagger configuration
├── controllers/              # Route controllers
│   ├── auth/                # Authentication controllers
│   └── user/                # User management controllers
├── database/                 # Database configuration
│   ├── client.ts            # Prisma client instance
│   └── seed.ts              # Database seed script
├── middleware/              # Express middleware
│   ├── auth/                # Authentication middleware
│   ├── error/               # Error handling middleware
│   ├── security/            # Security middleware (rate limiting)
│   └── validation/          # Request validation
├── routes/                  # API routes
│   └── api/v1/              # Version 1 API routes
├── services/                # Business logic
│   ├── auth/                # Authentication services
│   ├── cache.ts             # Cache service
│   └── user/                # User services
├── utils/                   # Utility functions
│   ├── auth.ts              # Authentication utilities
│   ├── email.ts             # Email utilities
│   └── logger.ts            # Structured logging
└── __tests__/               # Test files
    ├── setup.ts             # Test configuration
    ├── unit/                # Unit tests
    └── integration/         # Integration tests
```

## Available Scripts

### Development
- `bun dev` - Start development server with hot reload
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint
- `bun format` - Format code with Prettier

### Database
- `bun prisma:generate` - Generate Prisma client
- `bun prisma:migrate` - Run database migrations
- `bun prisma:studio` - Open Prisma Studio GUI
- `bun prisma:seed` - Seed database with sample data

### Testing
- `bun test` - Run all tests
- `bun test:unit` - Run unit tests
- `bun test:integration` - Run integration tests
- `bun test:coverage` - Run tests with coverage
- `bun test:watch` - Run tests in watch mode

### Docker
- `bun docker:start` - Start Redis
- `bun docker:start-all` - Start all services
- `bun docker:stop` - Stop Redis
- `bun docker:status` - Check service status
- `bun docker:logs` - View service logs

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login with email and password
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (requires auth)
- `GET /api/v1/auth/profile` - Get current user profile (requires auth)
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/request-password-reset` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### Users
- `GET /api/v1/users` - Get all users (requires auth)
- `POST /api/v1/users` - Create a new user (requires manager role)
- `GET /api/v1/users/:id` - Get user by ID (requires auth)
- `PUT /api/v1/users/:id` - Update user (requires auth)
- `DELETE /api/v1/users/:id` - Delete user (requires admin role)
- `PATCH /api/v1/users/:id/status` - Update user status (requires manager role)
- `PUT /api/v1/users/my-profile` - Update current user profile (requires auth)
- `POST /api/v1/users/change-password` - Change password (requires auth)

## Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Account Creation**: 3 accounts per hour per IP
- **Password Reset**: 3 requests per hour per IP
- **Email Verification**: 5 requests per hour per IP

### Password Policy
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- Blacklisted common passwords
- Different from previous password

### Token Security
- Access tokens: 15 minutes expiry
- Refresh tokens: 7 days expiry, hashed in database
- Secure token generation with crypto module

### Caching Strategy
- User authentication data cached for 5 minutes
- Cache invalidation on logout and profile updates
- Graceful degradation when Redis unavailable

## Test Credentials

After running the seed script, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super.admin@example.com | NewPass@123 |
| Manager | manager@example.com | NewPass@123 |
| User | user1@example.com | NewPass@123 |
| User | user2@example.com | NewPass@123 |
| User (Unverified) | user3@example.com | NewPass@123 |

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| NODE_ENV | Environment (development/production/test) | No | development |
| PORT | Server port | No | 4000 |
| DATABASE_URL | Database connection string | Yes | - |
| JWT_SECRET | Secret key for JWT tokens (min 32 chars) | Yes | - |
| JWT_EXPIRES_IN | Access token expiry | No | 15m |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | No | 7d |
| SMTP_HOST | Email SMTP host | No | - |
| SMTP_PORT | Email SMTP port | No | 587 |
| SMTP_USER | SMTP username | No | - |
| SMTP_PASS | SMTP password | No | - |
| EMAIL_FROM | From email address | No | noreply@app.com |
| CORS_ORIGIN | Allowed CORS origins | No | * |
| REDIS_URL | Redis connection URL | No | - |
| FRONTEND_URL | Frontend application URL | No | http://localhost:3001 |
| ADMIN_URL | Admin panel URL | No | http://localhost:3002 |

## Database Schema

### User Model
```prisma
model User {
  id                     String    @id @default(cuid())
  email                  String    @unique
  password               String
  firstName              String
  lastName               String
  profilePhoto           String?
  role                   String    @default("USER")
  status                 String    @default("PENDING_VERIFICATION")
  refreshToken           String?   // Hashed for security
  lastLoginAt            DateTime?
  emailVerificationToken String?
  emailVerifiedAt        DateTime?
  passwordResetToken     String?
  passwordResetExpires   DateTime?
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
  auditLogs              AuditLog[]
}
```

### Enums (stored as strings)
- **UserRole**: SUPER_ADMIN, MANAGER, USER
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION

## Monitoring & Logging

### Structured Logging
- **Winston logger** with multiple transports
- **Log files**: `logs/error.log`, `logs/combined.log`
- **Log levels**: error, warn, info, http, debug
- **Request logging** with Morgan integration

### Health Check
```bash
curl http://localhost:4000/health
```

## Extending the Template

### Adding New Features

1. **Create new models** in `prisma/schema.prisma`
2. **Run migrations**: `bun prisma migrate dev --name your_feature`
3. **Create services** in `src/services/`
4. **Create controllers** in `src/controllers/`
5. **Add routes** in `src/routes/api/v1/`
6. **Add validation schemas** in `src/middleware/validation/schemas/`
7. **Write tests** in `src/__tests__/`
8. **Update Swagger docs** in route files

### Switching Databases

To switch from SQLite to PostgreSQL:

1. Update `datasource` in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

3. Use the provided PostgreSQL Docker service:
```bash
bun run docker:start-all
```

4. Run migrations:
```bash
bun prisma migrate dev
```

## Performance Optimization

### Caching Strategy
- **User authentication**: Cached for 5 minutes
- **Database queries**: Consider implementing query result caching
- **Static data**: Cache configuration and lookup data

### Database Optimization
- **Indexes**: Added on frequently queried fields
- **Connection pooling**: Configured for production
- **Query optimization**: Use Prisma's query engine features

## Troubleshooting

### Common Issues

1. **Prisma Studio Error**: Make sure to run migrations first:
   ```bash
   bun prisma migrate dev
   ```

2. **TypeScript Errors**: Regenerate Prisma client:
   ```bash
   bun prisma generate
   ```

3. **Database Locked**: Stop all running processes and try again

4. **Email Not Sending**: 
   - Check Gmail app-specific password
   - Enable "Less secure app access" or use OAuth2

5. **Redis Connection Issues**:
   ```bash
   # Check if Redis is running
   bun run docker:status
   
   # Restart Redis
   bun run docker:stop
   bun run docker:start
   ```

6. **Rate Limiting Issues**: Clear rate limit data:
   ```bash
   # Connect to Redis and flush data
   docker exec -it app-be-redis redis-cli FLUSHALL
   ```

### Development Tips

1. **Environment Validation**: The app validates all environment variables at startup
2. **Logging**: Check `logs/` directory for detailed error information
3. **Testing**: Run tests before committing changes
4. **Debugging**: Use `bun run dev` for hot reloading during development

## Security Considerations

- ✅ **Rate limiting** implemented for all auth endpoints
- ✅ **Strong password policies** enforced
- ✅ **Refresh tokens hashed** before database storage
- ✅ **Environment validation** at startup
- ✅ **Structured logging** for audit trails
- ✅ **Input validation** on all endpoints
- ✅ **CORS configuration** for cross-origin requests
- ✅ **Security headers** with Helmet.js
- ⚠️ **HTTPS**: Use in production
- ⚠️ **API monitoring**: Consider implementing in production
- ⚠️ **Dependency updates**: Keep dependencies current

## License

This project is licensed under the MIT License.