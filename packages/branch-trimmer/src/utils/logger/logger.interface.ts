export interface ILogger {
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug?(message: string): void;
}

export interface ILoggerOptions {
  useColors?: boolean;
  prefix?: string;
  timestamp?: boolean;
} 