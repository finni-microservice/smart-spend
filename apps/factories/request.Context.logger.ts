import { ConfigService, ConfigType } from '@nestjs/config';
import loggerConfig, { LOGGER_CONFIG_KEY } from '../config/logger.config';
import * as winston from 'winston';
import { Scope } from '@nestjs/common';
import { INQUIRER, REQUEST } from '@nestjs/core';
import { formatReqLogMessage } from '../utils/messageFormatter';
import { RequestContextService } from 'apps/request/requestContext.service';

export const REQ_CTX_LOGGER = 'req-ctx-logger';

export const reqCtxLoggerFactory = {
  provide: REQ_CTX_LOGGER,
  useFactory: (
    configService: ConfigService,
    reqService: RequestContextService,
    parentClass: object,
  ) => {
    const config = configService.get<ConfigType<typeof loggerConfig>>(LOGGER_CONFIG_KEY);
    if (!config) {
      throw new Error('Logger configuration is not defined');
    }

    return winston.createLogger({
      ...config.winston,
      format: winston.format.combine(config.winston.format, formatReqLogMessage()),
      defaultMeta: {
        ...config.winston.defaultMeta,
        type: 'REQ',
        cid: reqService.getCID() || 'N/A',
        route: reqService.getRoute(),
        context: parentClass.constructor.name,
      },
    });
  },
  scope: Scope.TRANSIENT,
  inject: [ConfigService, RequestContextService, INQUIRER, REQUEST],
};
