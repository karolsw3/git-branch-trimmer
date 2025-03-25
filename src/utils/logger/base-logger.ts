import { ILogger, ILoggerOptions } from './logger.interface';

export abstract class BaseLogger implements ILogger {
  protected options: ILoggerOptions;

  constructor(options: ILoggerOptions = {}) {
    this.options = {
      useColors: true,
      prefix: '',
      timestamp: false,
      ...options
    };
  }

  protected formatMessage(message: string): string {
    const parts: string[] = [];
    
    if (this.options.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }
    
    if (this.options.prefix) {
      parts.push(`[${this.options.prefix}]`);
    }
    
    parts.push(message);
    
    return parts.join(' ');
  }

  abstract info(message: string): void;
  abstract success(message: string): void;
  abstract warn(message: string): void;
  abstract error(message: string): void;
  debug?(message: string): void;
} 