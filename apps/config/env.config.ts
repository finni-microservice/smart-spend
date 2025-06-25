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
    APP_NAME: Joi.string().default('spend-smart-api'),
    INJECT_CID: Joi.boolean().default(false),
    LOGGER_MIN_LEVEL: Joi.string().default('debug'),
    LOGGER_DISABLE: Joi.boolean().default(false),
    // PostgreSQL Configuration - Optional for local/development
    POSTGRES_DB_HOST: Joi.string().when('NODE_ENV', {
      is: Joi.string().valid('production', 'staging'),
      then: Joi.required(),
      otherwise: Joi.optional().default('localhost'),
    }),
    POSTGRES_DB_PORT: Joi.number().default(5432),
    POSTGRES_DB_USERNAME: Joi.string().when('NODE_ENV', {
      is: Joi.string().valid('production', 'staging'),
      then: Joi.required(),
      otherwise: Joi.optional().default('postgres'),
    }),
    POSTGRES_DB_PASSWORD: Joi.string().when('NODE_ENV', {
      is: Joi.string().valid('production', 'staging'),
      then: Joi.required(),
      otherwise: Joi.optional().default('password'),
    }),
    POSTGRES_DB_NAME: Joi.string().when('NODE_ENV', {
      is: Joi.string().valid('production', 'staging'),
      then: Joi.required(),
      otherwise: Joi.optional().default('spend_smart_db'),
    }),
    // Stripe Configuration - Optional for local/development
    STRIPE_SECRET_KEY: Joi.string().when('NODE_ENV', {
      is: Joi.string().valid('production', 'staging'),
      then: Joi.required(),
      otherwise: Joi.optional().default('sk_test_dummy_key'),
    }),
    STRIPE_WEBHOOK_SECRET: Joi.string().when('NODE_ENV', {
      is: Joi.string().valid('production', 'staging'),
      then: Joi.required(),
      otherwise: Joi.optional().default('whsec_dummy_secret'),
    }),
    // Optional Axiom logging
    AXIOM_TOKEN: Joi.string().optional(),
    AXIOM_ORG_ID: Joi.string().optional(),
    AXIOM_DATASET: Joi.string().optional(),
  }),
};
