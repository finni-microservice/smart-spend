import { format } from 'winston';
import * as chalk from 'chalk';
import { colorizeLevel, colorizeMessage } from './colorize';
import { Format } from 'logform';

export const formatReqLogMessage = (): Format =>
  format.printf(info => {
    const message = `${colorizeLevel(info.level || '')} ${chalk.yellow(`[${info.app}]`)} ${colorizeMessage(info.level, `[${info.route}]`)} ${info.timestamp} ${chalk.green(info.type)} ${chalk.yellow(`[${info.context}]`)} ${colorizeMessage(info.level, JSON.stringify(info.message, null, 2))} ${colorizeMessage(info.level, `[${info.cid}]`)}`;

    if (process.env.NODE_ENV === 'production')
      return `${message}\n${JSON.stringify(info, null, 2)}`;

    return message;
  });

export const formatAppLogMessage = (): Format =>
  format.printf(info => {
    const message = `${colorizeLevel(info.level || '')} ${chalk.yellow(`[${info.app}]`)} ${info.timestamp} ${chalk.green(info.type)} ${chalk.yellow(`[${info.context}]`)} ${colorizeMessage(info.level, info.message as string)}`;

    if (process.env.NODE_ENV === 'production') return `${message}`;

    return message;
  });
