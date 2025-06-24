import { Inject, Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger as WLogger } from 'winston';
import mongoose, { Connection } from 'mongoose';
import { Sequelize } from 'sequelize-typescript';
import { ConfigOptions } from '../config/env.config';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
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
    PostgresqlModule,
    StripeModule,
    DataExtractorModule,
    LoggerModule,
    RequestContextModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger, Connection, appLoggerFactory, reqCtxLoggerFactory],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private readonly configService: ConfigService,
    @Inject(APP_LOGGER) private readonly logger: WLogger,
    @InjectConnection() private readonly connection: Connection,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
  ) {
    // MongoDB connection events
    this.connection.on('open', () => {
      this.logger.info('MongoDB connection established successfully');
    });

    this.connection.on('error', _error => {
      this.logger.error('MongoDB connection error:', _error);
    });

    // PostgreSQL connection events
    this.sequelize
      .authenticate()
      .then(() => {
        this.logger.info('PostgreSQL connection established successfully');
      })
      .catch(error => {
        this.logger.error('PostgreSQL connection error:', error);
      });
  }

  onApplicationBootstrap() {
    this.logger.info(
      `APP: [${this.configService.get('APP_NAME')}] Running in ${this.configService.get('NODE_ENV')} mode on PORT ${this.configService.get('PORT')}`,
    );
  }
}
