import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Axiom } from '@axiomhq/js';
import { APP_LOGGER } from 'apps/factories/app.logger';
import { REQ_CTX_LOGGER } from 'apps/factories/request.Context.logger';
import { Logger } from 'winston';

@Injectable()
export class AppService {
  private readonly axiom: Axiom;

  constructor(
    private readonly configService: ConfigService,
    @Inject(REQ_CTX_LOGGER) private readonly logger: Logger,
    @Inject(APP_LOGGER) private readonly appLogger: Logger,
  ) {
    this.axiom = new Axiom({
      token: this.configService.get('env.axiomToken'),
    });
  }

  async getHello(): Promise<string> {
    this.logger.debug('Hello from AppService');
    this.appLogger.debug('Hello from AppService');

    // Log business logic to Axiom
    await this.axiom.ingest(this.configService.get('env.axiomDataset'), {
      _time: new Date().toISOString(),
      message: 'Processing getHello business logic',
      service: 'app-service',
      method: 'getHello',
      environment: this.configService.get('env.nodeEnv'),
      apiPrefix: this.configService.get('env.apiPrefix'),
    });

    return `Hello World! from ${this.configService.get('env.apiPrefix')}`;
  }
}
