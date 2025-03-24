import chalk from 'chalk';
import { BaseLogger } from './logger/base-logger';
import { ILoggerOptions } from './logger.interface';

export class ConsoleLogger extends BaseLogger {
  constructor(options: ILoggerOptions = {}) {
    super(options);
  }

  info(message: string): void {
    const formattedMessage = this.formatMessage(message);
    if (this.options.useColors) {
      console.log(chalk.blue(formattedMessage));
    } else {
      console.log(formattedMessage);
    }
  }

  success(message: string): void {
    const formattedMessage = this.formatMessage(message);
    if (this.options.useColors) {
      console.log(chalk.green(formattedMessage));
    } else {
      console.log(formattedMessage);
    }
  }

  warn(message: string): void {
    const formattedMessage = this.formatMessage(message);
    if (this.options.useColors) {
      console.log(chalk.yellow(formattedMessage));
    } else {
      console.log(formattedMessage);
    }
  }

  error(message: string): void {
    const formattedMessage = this.formatMessage(message);
    if (this.options.useColors) {
      console.error(chalk.red(formattedMessage));
    } else {
      console.error(formattedMessage);
    }
  }

  debug(message: string): void {
    const formattedMessage = this.formatMessage(message);
    if (this.options.useColors) {
      console.debug(chalk.gray(formattedMessage));
    } else {
      console.debug(formattedMessage);
    }
  }
} 