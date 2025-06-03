import { registerAs } from '@nestjs/config';
import { transports, format } from 'winston';
import { WinstonTransport as AxiomTransport } from '@axiomhq/winston';

export const LOGGER_CONFIG_KEY = 'logger-config';

export default registerAs(LOGGER_CONFIG_KEY, () => {
  let logFormat: any = format.combine(format.timestamp(), format.json());
  const defaultMeta = {
    layer: 'App',
    app: process.env.APP_NAME, // this is an optional meta field
    context: 'unspecified', // is overridden by the logger factory and the NestJSLoggerService
    type: 'LOG',
  };
  switch (process.env.NODE_ENV) {
    case 'production':
      logFormat = format.combine(format.timestamp(), format.json(), format.prettyPrint());
      break;
    default:
      logFormat = format.combine(format.timestamp(), format.json(), format.prettyPrint());
      break;
  }

  const winstonTransports = [];
  if (process.env.NODE_ENV === 'production') {
    winstonTransports.push(
      new AxiomTransport({
        dataset: process.env.AXIOM_DATASET,
        token: process.env.AXIOM_TOKEN,
      }),
    );
  } else {
    winstonTransports.push(new transports.Console());
  }

  return {
    winston: {
      level: process.env.LOGGER_MIN_LEVEL || 'debug',
      silent: process.env.LOGGER_DISABLE === 'true',
      transports: winstonTransports,
      format: logFormat,
      defaultMeta,
    },
  };
});
