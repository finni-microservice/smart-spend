import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RedisService } from 'apps/libs/redis/redis.service';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

export const RATE_LIMIT_KEY = 'rate-limit';

export const RateLimit = (options: RateLimitOptions) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflector.createDecorator<RateLimitOptions>()(options)(target, propertyKey, descriptor);
    } else {
      Reflector.createDecorator<RateLimitOptions>()(options)(target);
    }
  };
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const classRef = context.getClass();

    // Get rate limit options from decorator
    const options =
      this.reflector.get<RateLimitOptions>(RATE_LIMIT_KEY, handler) ||
      this.reflector.get<RateLimitOptions>(RATE_LIMIT_KEY, classRef);

    if (!options) {
      return true; // No rate limiting configured
    }

    const key = this.generateKey(request, options);
    // const current = await this.getCurrentCount(key);
    const windowStart = Date.now() - options.windowMs;

    // Clean old entries and count current requests
    const currentRequests = await this.countRequestsInWindow(key, windowStart);

    if (currentRequests >= options.maxRequests) {
      const resetTime = Math.ceil(
        ((await this.getOldestRequestTime(key)) + options.windowMs) / 1000,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests',
          error: 'Rate limit exceeded',
          retryAfter: resetTime,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Record this request
    await this.recordRequest(key, Date.now(), options.windowMs);

    return true;
  }

  private generateKey(request: Request, options: RateLimitOptions): string {
    if (options.keyGenerator) {
      return options.keyGenerator(request);
    }

    // Default key generation: IP + User ID (if available) + endpoint
    const ip = this.getClientIp(request);
    const userId = (request as any).user?.id || 'anonymous';
    const endpoint = `${request.method}:${request.route?.path || request.path}`;

    return `rate_limit:${ip}:${userId}:${endpoint}`;
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string) ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.ip ||
      'unknown'
    )
      .split(',')[0]
      .trim();
  }

  private async getCurrentCount(key: string): Promise<number> {
    try {
      const count = await this.redisService.get(key);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Redis error in rate limiting:', error);
      return 0; // Fail open
    }
  }

  private async countRequestsInWindow(key: string, windowStart: number): Promise<number> {
    try {
      // Use Redis sorted set to track requests with timestamps
      const count = await this.redisService.zcount(key, windowStart, '+inf');
      return count;
    } catch (error) {
      console.error('Redis error in rate limiting:', error);
      return 0; // Fail open
    }
  }

  private async getOldestRequestTime(key: string): Promise<number> {
    try {
      const oldest = await this.redisService.zrange(key, 0, 0, 'WITHSCORES');
      return oldest.length > 0 ? parseInt(oldest[1], 10) : Date.now();
    } catch (error) {
      console.error('Redis error in rate limiting:', error);
      return Date.now(); // Fail safe
    }
  }

  private async recordRequest(key: string, timestamp: number, windowMs: number): Promise<void> {
    try {
      const pipeline = this.redisService.pipeline();

      // Add current request with timestamp as score
      pipeline.zadd(key, timestamp, `${timestamp}-${Math.random()}`);

      // Remove old entries outside the window
      pipeline.zremrangebyscore(key, '-inf', timestamp - windowMs);

      // Set expiration to cleanup old keys
      pipeline.expire(key, Math.ceil(windowMs / 1000) + 10);

      await pipeline.exec();
    } catch (error) {
      console.error('Redis error recording request:', error);
      // Don't throw - fail open for availability
    }
  }
}
