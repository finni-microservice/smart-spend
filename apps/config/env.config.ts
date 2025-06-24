import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('env', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  axiomToken: process.env.AXIOM_TOKEN,
  axiomOrgId: process.env.AXIOM_ORG_ID,
  axiomDataset: process.env.AXIOM_DATASET || '',
}));

export const ConfigOptions = {
  isGlobal: true,
  envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'staging', 'local')
      .default('development'),
    PORT: Joi.number().default(3000),
    MONGO_URI: Joi.string().required(),
    MONGO_DB_NAME: Joi.string().required(),
    APP_NAME: Joi.string(),
    INJECT_CID: Joi.boolean().default(false),
    LOGGER_MIN_LEVEL: Joi.string().default('debug'),
    LOGGER_DISABLE: Joi.boolean().default(false),
    // PostgreSQL Configuration
    POSTGRES_DB_HOST: Joi.string().required(),
    POSTGRES_DB_PORT: Joi.number().default(5432),
    POSTGRES_DB_USERNAME: Joi.string().required(),
    POSTGRES_DB_PASSWORD: Joi.string().required(),
    POSTGRES_DB_NAME: Joi.string().required(),
    // Stripe Configuration
    STRIPE_SECRET_KEY: Joi.string().required(),
    STRIPE_WEBHOOK_SECRET: Joi.string().required(),
  }),
};
