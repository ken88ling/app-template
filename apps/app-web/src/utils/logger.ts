// Dynamic imports for server-side modules
let fs: typeof import("fs") | undefined;
let path: typeof import("path") | undefined;

if (typeof window === "undefined") {
  // Only import on server side
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  fs = require("fs");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  path = require("path");
}

// Configuration constants
const LOG_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  MAX_FILES_TO_KEEP: 5, // Number of log files to retain
  LOG_DIR_NAME: "logs", // Directory name for logs
  BATCH_SIZE: 100, // Number of logs to batch before writing
  FLUSH_INTERVAL: 5000, // Flush logs every 5 seconds
} as const;

// eslint-disable-next-line no-unused-vars
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: Error;
  stack?: string;
}

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFileLogging: boolean;
  logDir: string;
  maxFileSize: number; // in bytes
  maxFiles: number;
  batchSize: number;
  flushInterval: number;
}

class Logger {
  private config: LoggerConfig = {
    level: process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG,
    enableConsole: true,
    enableFileLogging: typeof window === "undefined", // Only on server
    logDir: path ? path.join(process.cwd(), LOG_CONFIG.LOG_DIR_NAME) : "",
    maxFileSize: LOG_CONFIG.MAX_FILE_SIZE,
    maxFiles: LOG_CONFIG.MAX_FILES_TO_KEEP,
    batchSize: LOG_CONFIG.BATCH_SIZE,
    flushInterval: LOG_CONFIG.FLUSH_INTERVAL,
  };

  private currentLogFile: string | null = null;
  private logBuffer: string[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize file logging on server side
    if (this.config.enableFileLogging) {
      this.initializeFileLogging();
      // Set up periodic flush
      this.startFlushTimer();
      
      // Ensure logs are flushed on process exit
      if (typeof process !== "undefined") {
        process.on("exit", () => this.flush());
        process.on("SIGINT", () => this.flush());
        process.on("SIGTERM", () => this.flush());
      }
    }
  }

  private initializeFileLogging(): void {
    if (!fs || !path) {
      this.config.enableFileLogging = false;
      return;
    }

    try {
      // Create logs directory if it doesn't exist
      if (!fs.existsSync(this.config.logDir)) {
        fs.mkdirSync(this.config.logDir, { recursive: true });
      }

      // Set up log rotation
      this.rotateLogsIfNeeded();
    } catch (error) {
      console.error("Failed to initialize file logging:", error);
      this.config.enableFileLogging = false;
    }
  }

  private getLogFileName(): string {
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0];
    return `app-web-${dateStr}.log`;
  }

  private rotateLogsIfNeeded(): void {
    if (!this.config.enableFileLogging || !fs || !path) return;

    try {
      const logFile = path.join(this.config.logDir, this.getLogFileName());
      
      // Check if current log file exists and its size
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.size >= this.config.maxFileSize) {
          // Rotate the log file
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const rotatedFile = path.join(
            this.config.logDir,
            `app-web-${timestamp}.log`
          );
          fs.renameSync(logFile, rotatedFile);
        }
      }

      // Clean up old log files
      this.cleanupOldLogs();

      // Update current log file
      this.currentLogFile = logFile;
    } catch (error) {
      console.error("Failed to rotate logs:", error);
    }
  }

  private cleanupOldLogs(): void {
    if (!fs || !path) return;
    
    try {
      const files = fs.readdirSync(this.config.logDir);
      const logFiles = files
        .filter(file => file.startsWith("app-web-") && file.endsWith(".log"))
        .map(file => ({
          name: file,
          path: path.join(this.config.logDir, file),
          time: fs.statSync(path.join(this.config.logDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      // Remove old files if we exceed maxFiles
      if (logFiles.length > this.config.maxFiles) {
        const filesToDelete = logFiles.slice(this.config.maxFiles);
        filesToDelete.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error(`Failed to delete old log file ${file.name}:`, error);
          }
        });
      }
    } catch (error) {
      console.error("Failed to cleanup old logs:", error);
    }
  }

  private formatMessage(entry: LogEntry): string {
    const levelStr = LogLevel[entry.level].padEnd(5);
    const contextStr = entry.context ? `[${entry.context}]` : "";
    return `[${entry.timestamp}] ${levelStr} ${contextStr} ${entry.message}`;
  }

  private startFlushTimer(): void {
    if (this.flushTimer) return;
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private flush(): void {
    if (this.logBuffer.length === 0 || !this.currentLogFile || !fs) return;

    try {
      // Join all buffered logs
      const logs = this.logBuffer.join("");
      
      // Write batch to file
      fs.appendFileSync(this.currentLogFile, logs);
      
      // Clear buffer
      this.logBuffer = [];
      
      // Check if rotation is needed
      const stats = fs.statSync(this.currentLogFile);
      if (stats.size >= this.config.maxFileSize) {
        this.rotateLogsIfNeeded();
      }
    } catch (error) {
      console.error("Failed to flush logs:", error);
    }
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.config.enableFileLogging || !this.currentLogFile) return;

    try {
      const logMessage = this.formatMessage(entry);
      let fullMessage = logMessage;

      // Add data if present
      if (entry.data) {
        fullMessage += "\n  Data: " + JSON.stringify(entry.data, null, 2);
      }

      // Add stack trace if present
      if (entry.stack) {
        fullMessage += "\n  Stack: " + entry.stack;
      }

      fullMessage += "\n";

      // Add to buffer
      this.logBuffer.push(fullMessage);

      // Flush if buffer is full
      if (this.logBuffer.length >= this.config.batchSize) {
        this.flush();
      }
    } catch (error) {
      console.error("Failed to buffer log:", error);
    }
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    if (level > this.config.level) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
    };

    // Extract error information if data is an Error
    if (data instanceof Error) {
      entry.error = data;
      entry.stack = data.stack;
      entry.data = {
        name: data.name,
        message: data.message,
        stack: data.stack,
      };
    }

    // Console logging
    if (this.config.enableConsole) {
      const formattedMessage = this.formatMessage(entry);
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage, data);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, data);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, data);
          break;
        case LogLevel.DEBUG:
          console.log(formattedMessage, data);
          break;
      }
    }

    // File logging (server-side only)
    if (typeof window === "undefined") {
      this.writeToFile(entry);
    }
  }

  // Public methods
  error(message: string, error?: unknown, context?: string): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  info(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  debug(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  // Configuration methods
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  setLogDir(dir: string): void {
    this.config.logDir = dir;
    if (this.config.enableFileLogging) {
      this.initializeFileLogging();
    }
  }

  setMaxFileSize(sizeInMB: number): void {
    this.config.maxFileSize = sizeInMB * 1024 * 1024;
  }

  setMaxFiles(count: number): void {
    this.config.maxFiles = count;
  }

  setBatchSize(size: number): void {
    this.config.batchSize = size;
  }

  setFlushInterval(intervalMs: number): void {
    this.config.flushInterval = intervalMs;
    // Restart timer with new interval
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.startFlushTimer();
    }
  }

  // Cleanup method
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    // Flush any remaining logs
    this.flush();
  }

  // Utility methods for server-side only
  getLogs(date?: string): string | null {
    if (typeof window !== "undefined" || !this.config.enableFileLogging || !fs || !path) return null;

    try {
      const fileName = date 
        ? `app-web-${date}.log`
        : this.getLogFileName();
      const logFile = path.join(this.config.logDir, fileName);
      
      if (fs.existsSync(logFile)) {
        return fs.readFileSync(logFile, "utf-8");
      }
      
      return null;
    } catch (error) {
      console.error("Failed to read logs:", error);
      return null;
    }
  }

  getLogFiles(): string[] {
    if (typeof window !== "undefined" || !this.config.enableFileLogging || !fs || !path) return [];

    try {
      const files = fs.readdirSync(this.config.logDir);
      return files
        .filter(file => file.startsWith("app-web-") && file.endsWith(".log"))
        .sort()
        .reverse();
    } catch (error) {
      console.error("Failed to list log files:", error);
      return [];
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Export logger instance and types
export default logger;
export { Logger };