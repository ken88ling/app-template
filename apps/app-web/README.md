# Web App

A Next.js-based web application with authentication system and user management.

## 🚀 Features

- **User Authentication**

  - Login and registration with email/password
  - Secure cookie-based authentication
  - Password reset functionality
  - Protected routes with middleware

- **User Management**

  - User registration and profile management
  - Email verification system
  - Role-based access control

- **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - Clean and intuitive interface
  - Form validation and error handling
  - Loading states and feedback

## 🛠 Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (beta)
- **Authentication**: Cookie-based with JWT tokens
- **Rendering**: Server-Side Rendering (SSR)
- **API Integration**: RESTful API communication with backend
- **Type Safety**: Shared types from @app/shared-types package

## 📋 Prerequisites

Before running the web app, ensure you have:

- Node.js 18+ or Bun runtime
- Backend API (app-be) running on port 4000
- Database seeded with user credentials

## ⚙️ Installation

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Set up environment variables**:

   ```bash
   # Create .env.local file
   NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
   ```

3. **Start the development server**:

   ```bash
   bun run dev
   ```

   The web app will be available at: `http://localhost:3000`

## 🔐 Authentication

### Test Credentials

Use these test credentials to login:

- **Email**: `user1@example.com`
- **Password**: `Password123`

### Login Form Features

- **Email & Password Authentication**: Secure login with email and password fields
- **Remember Me**: Option to stay logged in across browser sessions
- **Forgot Password**: Link to password reset functionality
- **Form Validation**: Real-time validation with error feedback
- **Loading States**: Visual feedback during authentication

### Security Features

- HTTP-only cookies prevent XSS attacks
- Server-side authentication verification
- Automatic session management
- Protected route middleware

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register, forgot-password)
│   ├── api/               # API routes for authentication
│   │   └── auth/         # Login, logout, profile, register endpoints
│   ├── globals.css       # Global styles with Tailwind v4
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Authentication state management
├── middleware.ts          # Route protection middleware
└── services/             # API services
    ├── api.ts            # Generic API client (fetch-based)
    ├── authService.ts    # Authentication service using shared types
    └── userService.ts    # User management service using shared types
```

## 🔧 Key Components

### Server Components

- **Authentication Pages**: Server-rendered login, register, forgot password
- **Home Page**: Protected route with user dashboard
- **API Routes**: Handle authentication operations

### Client Components

- **Auth Forms**: Interactive authentication forms
- **Auth Context**: Global authentication state management

## 🚦 API Endpoints

### Internal API Routes (Web App)

- `POST /api/auth/login` - User login with cookie setting
- `POST /api/auth/logout` - Logout and clear cookies
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get current user profile

### External API Integration (Backend)

- Connects to backend API running on port 4000
- Validates credentials against user database
- Fetches user profile and permissions

## 🔄 Authentication Flow

1. **Registration**: User signs up → Email verification → Account activation
2. **Login**: User submits credentials → API validates → Sets HTTP-only cookies → Redirects to home
3. **Protected Access**: Middleware checks cookies → Validates with backend → Grants access or redirects to login
4. **Logout**: Client calls logout API → Clears cookies → Redirects to login

## 🎨 UI/UX

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Clean Interface**: Minimal and professional design
- **Form Validation**: Real-time validation with error messages
- **Loading States**: Smooth transitions and user feedback
- **Accessibility**: WCAG compliant components

## 🔧 Development Commands

```bash
# Start development server (port 3000)
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run linting
bun run lint
```

## 🚢 Deployment

### Production Build

```bash
bun run build
bun run start
```

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
NODE_ENV=production
```

## 🛡️ Security Considerations

- **HTTP-Only Cookies**: Prevents client-side script access to tokens
- **SameSite Policy**: Protects against CSRF attacks
- **Server-Side Rendering**: Authentication verified before page render
- **Route Protection**: Middleware-based access control
- **Secure Headers**: Production-ready security configurations

## 🐛 Troubleshooting

### Common Issues

1. **Authentication redirect loops**:

   - Ensure backend (app-be) is running on port 4000
   - Verify user exists in database
   - Check browser cookies are enabled

2. **Registration/login failures**:

   - Confirm correct credentials format
   - Verify backend database is seeded
   - Check API endpoint connectivity

3. **Page not loading after authentication**:
   - Check browser console for errors
   - Verify cookies are being set properly
   - Ensure middleware configuration is correct

## 🔗 Related Projects

- **app-be**: Backend API server
- **app-admin**: Admin portal
- **app-mobile**: Mobile application

## 📝 Development Notes

- Uses Next.js App Router with server components for optimal performance
- Authentication state managed through secure HTTP-only cookies
- Server-side rendering eliminates client-side authentication issues
- TypeScript provides type safety across the application
- Tailwind CSS v4 (beta) with custom theme configuration
- Middleware handles route protection and redirects
- All types imported from centralized @app/shared-types package
- Uses WebAuthResponse for authentication responses
- User service fully typed with shared interfaces

## 🤝 Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript for all new components
3. Maintain server-side rendering patterns for authenticated pages
4. Test authentication flows thoroughly
5. Update documentation for new features
