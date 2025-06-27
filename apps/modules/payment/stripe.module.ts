import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { RedisService } from 'apps/libs/redis/redis.service';
import redisConfig from 'apps/libs/redis/config/redis.config';
import { appLoggerFactory } from 'apps/factories/app.logger';
import loggerConfig from 'apps/config/logger.config';

@Module({
  imports: [ConfigModule.forFeature(redisConfig), ConfigModule.forFeature(loggerConfig)],
  providers: [StripeService, RateLimitGuard, RedisService, appLoggerFactory],
  controllers: [StripeController],
  exports: [StripeService, RateLimitGuard],
})
export class StripeModule {}
