# Admin Portal

A Next.js-based admin portal with simple authentication and home page display. This application provides basic admin authentication with a clean welcome interface.

## 🚀 Features

- **Simple Home Page** - Clean welcome interface after login
- **Admin-Only Access** - Role-based authentication (MANAGER/SUPER_ADMIN)
- **Secure Cookie Authentication** - HTTP-only cookies for enhanced security
- **One-Click Logout** - Logout button on home page with redirect to login
- **Gray Theme UI** - Professional gray interface for admin tasks
- **Responsive Design** - Works seamlessly across desktop and mobile devices

## 🛠 Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (beta)
- **Authentication**: Cookie-based with JWT tokens
- **Rendering**: Server-Side Rendering (SSR)
- **API Integration**: RESTful API communication with app-be backend
- **Type Safety**: Shared types from @app/shared-types package

## 📋 Prerequisites

Before running the admin portal, ensure you have:

- Node.js 18+ or Bun runtime
- Backend API (gm-be) running on port 4000
- Database seeded with admin user credentials

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

   The admin portal will be available at: `http://localhost:3100`

## 🔐 Authentication

### Admin Credentials

- **Super Admin**: `super.admin@example.com` / `Password123`
- **Manager**: `manager@example.com` / `Password123`

### Security Features

- HTTP-only cookies prevent XSS attacks
- Server-side authentication verification
- Automatic session management
- Role-based access control (ADMIN/SUPER_ADMIN only)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for authentication
│   │   └── auth/         # Login, logout, profile endpoints
│   ├── login/            # Login page
│   ├── globals.css       # Global styles with Tailwind v4
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page with welcome message and logout
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Authentication state management
└── services/             # API services
    ├── api.ts            # Generic API client (fetch-based)
    └── authService.ts    # Authentication service using shared types
```

## 🔧 Key Components

### Server Components

- **Home Page**: Server-rendered with authentication checks and welcome message
- **API Routes**: Handle login, logout, and profile operations

### Client Components

- **Login Form**: Interactive authentication form
- **Auth Context**: Global authentication state management

## 🚦 API Endpoints

### Internal API Routes (Admin Portal)

- `POST /api/auth/login` - Admin login with cookie setting
- `POST /api/auth/logout` - Logout and clear cookies
- `GET /api/auth/profile` - Get current admin profile

### External API Integration (Backend)

- Connects to `app-be` backend running on port 4000
- Validates credentials against user database
- Fetches admin profile and permissions
- Admin role validation (MANAGER or SUPER_ADMIN required)

## 🔄 Authentication Flow

1. **Login**: User submits credentials → API validates → Sets HTTP-only cookies → Redirects to home page
2. **Home Access**: Server checks cookies → Validates with backend → Shows welcome message or redirects to login
3. **Logout**: Client calls logout API → Clears cookies → Redirects to login

## 🎨 UI/UX

- **Responsive Design**: Adaptive layout for different screen sizes
- **Loading States**: Smooth transitions and feedback
- **Error Handling**: User-friendly error messages
- **Simple Interface**: Clean and minimal design

## 📊 Home Page Features

- **Welcome Message**: Simple "Hello Admin!" greeting
- **Logout Button**: One-click logout functionality with redirect to login
- **Responsive Layout**: Centers content and adapts to screen size

## 🔧 Development Commands

```bash
# Start development server (port 3100)
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
- **Role Validation**: Multiple layers of admin role verification
- **Secure Headers**: Production-ready security configurations

## 🐛 Troubleshooting

### Common Issues

1. **"Redirecting to login..." loop**:

   - Ensure backend (gm-be) is running on port 4000
   - Verify admin user exists in database
   - Check browser cookies are enabled

2. **Authentication failures**:

   - Confirm correct admin credentials: `super.admin@example.com` / `Password123`
   - Verify backend database is seeded
   - Check API endpoint connectivity

3. **Page not loading after login**:
   - Server-side rendering should eliminate this issue
   - Check browser console for errors
   - Verify cookies are being set properly

## 🔗 Related Projects

- **app-be**: Backend API server
- **app-web**: Customer web portal
- **app-mobile**: Mobile application

## 📝 Development Notes

- Uses Next.js App Router with server components for optimal performance
- Authentication state managed through secure HTTP-only cookies
- Server-side rendering eliminates client-side authentication issues
- Simple home page design with logout functionality
- TypeScript provides type safety across the application
- Tailwind CSS v4 (beta) with custom theme configuration
- All types imported from centralized @app/shared-types package
- Admin-specific types: IUserAdmin extends IUserPublic with admin fields
- Uses AdminAuthResponse for authentication responses

## 🤝 Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript for all new components
3. Maintain server-side rendering patterns for authenticated pages
4. Test authentication flows thoroughly
5. Update documentation for new features
