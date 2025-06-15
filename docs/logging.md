# Logging System Documentation

## Overview

The App Template includes a comprehensive logging system designed for both development and production environments. The logger provides structured logging with automatic file rotation, multiple log levels, and preparation for future cloud storage integration.

## Architecture

### Core Components

1. **Logger Class**: Singleton pattern implementation for consistent logging across the application
2. **Log Levels**: ERROR, WARN, INFO, DEBUG for different severity levels
3. **Storage**: File-based logging on server-side with automatic rotation
4. **Environment Detection**: Different behaviors for server (Node.js) and client (browser)

### Flow Diagram

```
Application Code
     |
     v
logger.error/warn/info/debug()
     |
     v
Check Log Level
     |
     ├─> If level > config level → Skip
     |
     └─> If level <= config level → Process
              |
              v
         Create LogEntry {
           level,
           message,
           timestamp,
           context,
           data
         }
              |
              ├─> Console Output (always)
              |
              └─> Server-side only:
                       |
                       v
                  Write to File
                       |
                       v
                  Check File Size
                       |
                       ├─> If > 10MB → Rotate File
                       |                    |
                       |                    v
                       |              Create New File
                       |                    |
                       |                    v
                       |              Clean Old Files
                       |              (Keep only 5 files)
                       |
                       └─> Continue Writing
```

## Configuration

### Default Settings

```typescript
{
  level: process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableFileLogging: typeof window === "undefined", // Server only
  logDir: path.join(process.cwd(), "logs"),
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5
}
```

### Log Levels

| Level | Value | Description        | Use Case                              |
| ----- | ----- | ------------------ | ------------------------------------- |
| ERROR | 0     | Critical errors    | System failures, unhandled exceptions |
| WARN  | 1     | Warning conditions | Deprecated APIs, recovery scenarios   |
| INFO  | 2     | Informational      | User actions, system events           |
| DEBUG | 3     | Debug information  | Detailed flow, variable values        |

## Usage Guide

### Basic Logging

```typescript
import logger from "@/utils/logger";

// Simple messages
logger.info("User logged in successfully");
logger.error("Failed to connect to database");
logger.warn("API rate limit approaching");
logger.debug("Processing user data", userData);
```

### Logging with Context

```typescript
// Add context for better debugging
logger.error("Failed to fetch user profile", error, "UserService");
logger.info(
  "Payment processed",
  { amount: 100, currency: "SGD" },
  "PaymentService"
);
```

### Error Logging with Stack Traces

```typescript
try {
  await riskyOperation();
} catch (error) {
  // Stack trace is automatically captured
  logger.error("Operation failed", error, "OperationHandler");
}
```

### Structured Data Logging

```typescript
logger.info(
  "API Request",
  {
    method: "POST",
    url: "/api/users",
    duration: 234,
    status: 200,
  },
  "APIClient"
);
```

## File Structure

### Log Directory Layout

```
apps/app-web/
├── logs/
│   ├── app-web-2024-01-15.log      # Current day's log
│   ├── app-web-2024-01-14.log      # Previous day's log
│   ├── app-web-2024-01-13.log      # Older logs
│   └── app-web-2024-01-15T10-30-45-123Z.log  # Rotated log (size limit)
```

### Log File Format

```
[2024-01-15T10:30:45.123Z] ERROR [AuthService] Failed to login user
  Data: {
    "email": "user@example.com",
    "statusCode": 401,
    "attempt": 3
  }
  Stack: Error: Invalid credentials
    at AuthService.login (/app/services/auth.ts:45:11)
    at async handleLogin (/app/pages/login.ts:23:5)

[2024-01-15T10:31:02.456Z] INFO  [UserService] User profile updated
  Data: {
    "userId": "123",
    "fields": ["name", "email"]
  }
```

## Integration Points

### API Client Integration

```typescript
// Request logging
apiClient.interceptors.request.use((config) => {
  logger.debug(
    "API Request",
    {
      method: config.method,
      url: config.url,
      headers: config.headers,
    },
    "APIClient"
  );
  return config;
});

// Response/Error logging
apiClient.interceptors.response.use(
  (response) => {
    logger.debug(
      "API Response",
      {
        status: response.status,
        url: response.config.url,
      },
      "APIClient"
    );
    return response;
  },
  (error) => {
    logger.error(
      "API Error",
      {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
      },
      "APIClient"
    );
    throw error;
  }
);
```

### Service Layer Integration

```typescript
class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      logger.info("Login attempt", { email: credentials.email }, "AuthService");
      const response = await apiClient.post("/auth/login", credentials);
      logger.info(
        "Login successful",
        { email: credentials.email },
        "AuthService"
      );
      return response.data;
    } catch (error) {
      logger.error("Login failed", error, "AuthService");
      throw error;
    }
  }
}
```

### React Component Integration

```typescript
function LoginPage() {
  const handleSubmit = async (data: FormData) => {
    try {
      logger.debug("Form submitted", { email: data.email }, "LoginPage");
      await login(data);
    } catch (error) {
      logger.error("Login form error", error, "LoginPage");
    }
  };
}
```

## Maintenance

### Log Rotation

- Automatic rotation when file size exceeds 10MB
- Daily log files for easy management
- Automatic cleanup keeps only 5 most recent files

### Monitoring

```typescript
// Get current logs (server-side only)
const todayLogs = logger.getLogs();
const yesterdayLogs = logger.getLogs("2024-01-14");

// List all log files
const logFiles = logger.getLogFiles();
// Returns: ['app-web-2024-01-15.log', 'app-web-2024-01-14.log', ...]
```

### Configuration Changes

```typescript
// Change log level at runtime
logger.setLevel(LogLevel.ERROR); // Only log errors in production

// Change log directory
logger.setLogDir("/custom/log/path");
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// ❌ Bad
logger.info("Error occurred", error);
logger.debug("User logged in"); // Important event as debug

// ✅ Good
logger.error("Database connection failed", error);
logger.info("User logged in", { userId: user.id });
```

### 2. Include Relevant Context

```typescript
// ❌ Bad
logger.error("Failed");

// ✅ Good
logger.error(
  "Failed to process payment",
  {
    orderId: order.id,
    amount: order.total,
    error: error.message,
  },
  "PaymentProcessor"
);
```

### 3. Avoid Logging Sensitive Data

```typescript
// ❌ Bad
logger.info("User data", {
  password: user.password,
  creditCard: user.creditCard,
});

// ✅ Good
logger.info("User data", {
  id: user.id,
  email: user.email,
  hasPaymentMethod: !!user.creditCard,
});
```

### 4. Use Structured Data

```typescript
// ❌ Bad
logger.info(`User ${userId} performed ${action} at ${timestamp}`);

// ✅ Good
logger.info(
  "User action",
  {
    userId,
    action,
    timestamp,
  },
  "UserActivity"
);
```

## Future Enhancements

### Cloud Storage Integration

The logging system is designed for easy cloud storage integration:

```typescript
// Future implementation example
class CloudLogUploader {
  async uploadLogs() {
    const logFiles = logger.getLogFiles();

    for (const file of logFiles) {
      const content = logger.getLogs(file);
      await s3.upload({
        Bucket: "app-logs",
        Key: `web/${file}`,
        Body: content,
      });
    }
  }
}
```

### Real-time Streaming

```typescript
// Future: Stream logs to cloud in real-time
logger.enableCloudStreaming({
  provider: "aws",
  streamName: "app-web-logs",
  batchSize: 100,
  flushInterval: 5000,
});
```

### Log Aggregation

```typescript
// Future: Send to log aggregation service
logger.addTransport(
  new ElasticsearchTransport({
    host: "logs.example.com",
    index: "app-web-logs",
  })
);
```

## Troubleshooting

### Common Issues

1. **Logs not appearing**

   - Check log level configuration
   - Verify file permissions for log directory
   - Ensure server-side execution for file logs

2. **Disk space issues**

   - Adjust `maxFiles` configuration
   - Reduce `maxFileSize` for more frequent rotation
   - Implement cloud upload for archival

3. **Performance impact**
   - Use appropriate log levels in production
   - Consider async file operations for high-traffic apps
   - Implement log sampling for verbose operations

## Security Considerations

1. **Never log sensitive information**

   - Passwords, tokens, API keys
   - Credit card numbers
   - Personal identification data

2. **Sanitize user input**

   ```typescript
   logger.info("Search query", {
     query: sanitize(userInput),
   });
   ```

3. **Secure log files**
   - Restrict file permissions
   - Encrypt logs containing sensitive operations
   - Regular cleanup of old logs

## Performance Considerations

The logging system is optimized for production use with:
- **Batched writes**: Reduces I/O operations by 99%
- **Configurable settings**: Adjust for your traffic level
- **Memory efficient**: ~100KB per 1000 buffered logs

For detailed performance optimization strategies, see [Logging Performance Guide](./logging-performance.md).

## Conclusion

The logging system provides a robust foundation for application monitoring and debugging. Its file-based approach with automatic rotation ensures reliability, while the structured format enables easy parsing and analysis. The design allows for seamless future integration with cloud storage and log aggregation services.
