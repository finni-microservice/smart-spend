import { registerAs } from '@nestjs/config';

export const REDIS_CONFIG_KEY = 'redis';

export default registerAs(REDIS_CONFIG_KEY, () => {
  const port = Number(process.env.REDIS_PORT) || 6379;
  const isDevelopment = process.env.NODE_ENV === 'development';

  let tls;
  if (port === 6380) {
    tls = {};
  }
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port,
    username: process.env.REDIS_USERNAME || '',
    password: process.env.REDIS_PASS || '',
    // db: Number(process.env.REDIS_DB) || 0,
    tls,
    maxRetriesPerRequest: isDevelopment ? 1 : null,
    retryStrategy: isDevelopment ? () => null : undefined,
  };
});
