import { Injectable, LoggerService, Logger } from '@nestjs/common';
import { Axiom } from '@axiomhq/js';

@Injectable()
export class AxiomLoggerService implements LoggerService {
  private axiom: Axiom;
  private readonly logger: Logger;

  constructor() {
    this.axiom = new Axiom({
      token: process.env.AXIOM_TOKEN,
      orgId: process.env.AXIOM_ORG_ID,
    });
    this.logger = new Logger();
  }

  log(message: string, context?: string) {
    this.axiom.ingest('logs', {
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.axiom.ingest('logs', {
      level: 'error',
      message,
      trace,
      context,
      timestamp: new Date().toISOString(),
    });
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.axiom.ingest('logs', {
      level: 'warn',
      message,
      context,
      timestamp: new Date().toISOString(),
    });
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.axiom.ingest('logs', {
      level: 'debug',
      message,
      context,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: string) {
    this.axiom.ingest('logs', {
      level: 'verbose',
      message,
      context,
      timestamp: new Date().toISOString(),
    });
    this.logger.verbose(message, context);
  }
}
