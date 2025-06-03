import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import { Axiom } from '@axiomhq/js';

import { AppService } from 'apps/src/app.service';
import { REQ_CTX_LOGGER } from 'apps/factories/request.Context.logger';

@Controller()
export class AppController {
  private readonly axiom: Axiom;

  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    @Inject(REQ_CTX_LOGGER) private readonly logger: Logger,
  ) {
    this.axiom = new Axiom({
      token: this.configService.get('env.axiomToken'),
    });
  }

  @Get()
  async getHello(): Promise<string> {
    this.logger.info('Getting Hello from AppController');

    // Log to Axiom
    await this.axiom.ingest(this.configService.get('env.axiomDataset'), {
      _time: new Date().toISOString(),
      message: 'Getting Hello from AppController',
      service: 'app-controller',
      method: 'getHello',
      environment: this.configService.get('env.nodeEnv'),
    });

    return this.appService.getHello();
  }
}
