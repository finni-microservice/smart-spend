import { Inject, Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger as WLogger } from 'winston';
import mongoose, { Connection } from 'mongoose';
import { ConfigOptions } from '../config/env.config';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_LOGGER, appLoggerFactory } from 'apps/factories/app.logger';
import { reqCtxLoggerFactory } from 'apps/factories/request.Context.logger';
import { RequestContextService } from 'apps/request/requestContext.service';
import loggerConfig from 'apps/config/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      ...ConfigOptions,
      load: [loggerConfig],
    }),
    MongooseModule.forRootAsync({
      useFactory: async configService => {
        if (configService.get('NODE_ENV') === 'development') {
          mongoose.set('debug', true);
        }
        return {
          uri: configService.get('MONGO_URI'),
          dbName: configService.get('MONGO_DB_NAME'),
        };
      },
      inject: [ConfigService],
      // connectionName: 'nabiq-connection',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    Connection,
    appLoggerFactory,
    reqCtxLoggerFactory,
    RequestContextService,
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private readonly configService: ConfigService,
    @Inject(APP_LOGGER) private readonly logger: WLogger,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.connection.on('open', () => {
      this.logger.info('MongoDB connection established successfully');
    });

    this.connection.on('error', _error => {
      this.logger.error('MongoDB connection error:', _error);
    });
  }

  onApplicationBootstrap() {
    this.logger.info(
      `APP: [${this.configService.get('APP_NAME')}] Running in ${this.configService.get('NODE_ENV')} mode on PORT ${this.configService.get('PORT')}`,
    );
  }
}
