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
  }),
};
