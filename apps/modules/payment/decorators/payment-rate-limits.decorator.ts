import { SetMetadata } from '@nestjs/common';
import { RateLimitOptions } from '../guards/rate-limit.guard';

export const RATE_LIMIT_KEY = 'rate-limit';

// Payment operation rate limits (per IP + user combination)
export const PaymentRateLimits = {
  // Sensitive operations - stricter limits
  PAYMENT_CREATION: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 payment attempts per minute
  },

  REFUND_CREATION: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // 3 refunds per minute
  },

  SUBSCRIPTION_MODIFICATION: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 subscription changes per minute
  },

  // Read operations - more lenient
  DATA_RETRIEVAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },

  // General payment operations
  GENERAL_PAYMENT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute
  },

  // Admin operations - very strict
  ADMIN_OPERATIONS: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 admin requests per minute
  },
} as const;

// Decorator functions for easy application
export const PaymentCreationRateLimit = () =>
  SetMetadata(RATE_LIMIT_KEY, PaymentRateLimits.PAYMENT_CREATION);

export const RefundCreationRateLimit = () =>
  SetMetadata(RATE_LIMIT_KEY, PaymentRateLimits.REFUND_CREATION);

export const SubscriptionModificationRateLimit = () =>
  SetMetadata(RATE_LIMIT_KEY, PaymentRateLimits.SUBSCRIPTION_MODIFICATION);

export const DataRetrievalRateLimit = () =>
  SetMetadata(RATE_LIMIT_KEY, PaymentRateLimits.DATA_RETRIEVAL);

export const GeneralPaymentRateLimit = () =>
  SetMetadata(RATE_LIMIT_KEY, PaymentRateLimits.GENERAL_PAYMENT);

export const AdminOperationsRateLimit = () =>
  SetMetadata(RATE_LIMIT_KEY, PaymentRateLimits.ADMIN_OPERATIONS);

// Custom rate limit decorator
export const CustomPaymentRateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

// Special rate limit for webhook endpoints (higher limits but still protected)
export const WebhookRateLimit = () =>
  SetMetadata(RATE_LIMIT_KEY, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 webhook calls per minute (Stripe can send many)
    keyGenerator: req => {
      // Use only IP for webhooks since they come from Stripe
      const ip =
        (req.headers['x-forwarded-for'] as string) ||
        (req.headers['x-real-ip'] as string) ||
        req.connection.remoteAddress ||
        req.ip ||
        'unknown';
      return `webhook_rate_limit:${ip.split(',')[0].trim()}`;
    },
  } as RateLimitOptions);
