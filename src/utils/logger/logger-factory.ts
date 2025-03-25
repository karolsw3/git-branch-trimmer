import { ConsoleLogger } from './console-logger';
import { ILogger, ILoggerOptions } from './logger.interface';

export class LoggerFactory {
  private static instance: ILogger | undefined;

  static createLogger(options: ILoggerOptions = {}): ILogger {
    if (!this.instance) {
      this.instance = new ConsoleLogger(options);
    }
    return this.instance;
  }

  static reset(): void {
    this.instance = undefined;
  }
}
