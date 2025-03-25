/* eslint-disable no-console */
import { ChalkInstance } from 'chalk';

let chalk: ChalkInstance;
const initChalk = async () => {
  const chalkModule = await import('chalk');
  chalk = chalkModule.default;
  // Continue with your code after chalk is loaded
  return chalk;
};

import { BaseLogger } from './base-logger';
import { ILoggerOptions } from './logger.interface';

export class ConsoleLogger extends BaseLogger {
  constructor(options: ILoggerOptions = {}) {
    initChalk().then((chalkInstance) => {
      chalk = chalkInstance;
    });
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
