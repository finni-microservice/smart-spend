import * as chalk from 'chalk';

export function colorizeLevel(level: string): string {
  switch (level) {
    case 'info':
      return chalk.green(level.toUpperCase());
    case 'debug':
      return chalk.magenta(level.toUpperCase());
    case 'warn':
      return chalk.yellow(level.toUpperCase());
    case 'error':
      return chalk.red(level.toUpperCase());
    default:
      return chalk.white(level.toUpperCase());
  }
}

export function colorizeMessage(level: string, message: string): string {
  switch (level) {
    case 'info':
      return chalk.green(message);
    case 'debug':
      return chalk.magenta(message);
    case 'warn':
      return chalk.yellow(message);
    case 'error':
      return chalk.red(message);
    default:
      return chalk.green(message);
  }
}
