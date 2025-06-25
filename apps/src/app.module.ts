import { Inject, Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger as WLogger } from 'winston';
import { Sequelize } from 'sequelize-typescript';
import { ConfigOptions } from '../config/env.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_LOGGER, appLoggerFactory } from 'apps/factories/app.logger';
import { reqCtxLoggerFactory } from 'apps/factories/request.Context.logger';
import loggerConfig from 'apps/config/logger.config';
import { PostgresqlModule } from 'apps/libs/postgres/postgres.module';
import { StripeModule } from 'apps/modules/payment/stripe.module';
import { DataExtractorModule } from 'apps/modules/first-agent/service/data-extractor.module';
import { LoggerModule } from 'apps/logger/logger.module';
import { RequestContextModule } from 'apps/request/requestContext.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ...ConfigOptions,
      load: [loggerConfig],
    }),
    PostgresqlModule,
    StripeModule,
    DataExtractorModule,
    LoggerModule,
    RequestContextModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger, appLoggerFactory, reqCtxLoggerFactory],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private readonly configService: ConfigService,
    @Inject(APP_LOGGER) private readonly logger: WLogger,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
  ) {
    // PostgreSQL connection events - only if it's a real Sequelize instance
    if (this.sequelize && typeof this.sequelize.authenticate === 'function') {
      try {
        this.sequelize
          .authenticate()
          .then(() => {
            this.logger.info('PostgreSQL connection established successfully');
          })
          .catch(error => {
            const nodeEnv = this.configService.get('NODE_ENV');
            const isDev = ['development', 'local'].includes(nodeEnv);

            if (isDev) {
              this.logger.warn(
                'PostgreSQL connection failed in development mode - continuing without database',
              );
            } else {
              this.logger.error('PostgreSQL connection error:', error);
            }
          });
      } catch (error) {
        const nodeEnv = this.configService.get('NODE_ENV');
        const isDev = ['development', 'local'].includes(nodeEnv);

        if (isDev) {
          this.logger.warn('PostgreSQL not available in development mode');
        } else {
          this.logger.error('PostgreSQL initialization error:', error);
        }
      }
    } else {
      this.logger.info('Running in development mode without PostgreSQL connection');
    }
  }

  onApplicationBootstrap() {
    this.logger.info(
      `APP: [${this.configService.get('APP_NAME')}] Running in ${this.configService.get('NODE_ENV')} mode on PORT ${this.configService.get('PORT')}`,
    );
  }
}
