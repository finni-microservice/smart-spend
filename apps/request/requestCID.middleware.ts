import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import requestContextConfig, { REQUEST_CONTEXT_CONFIG_KEY } from './config/requestContext.config';
import { RequestWithCID } from './requestContext.service';
import { Response } from 'express';

@Injectable()
export class RequestCIDMiddleware implements NestMiddleware {
  private config: Record<string, any>;
  constructor(configService: ConfigService) {
    this.config = configService.get<typeof requestContextConfig>(REQUEST_CONTEXT_CONFIG_KEY);
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  use(req: RequestWithCID, res: Response, next: Function) {
    if (!this.config || !this.config.injectCID) {
      return next();
    }
    req.cid = uuid(); // Generate and store Correlation ID
    next();
  }
}
