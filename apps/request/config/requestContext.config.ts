import { registerAs } from '@nestjs/config';

export const REQUEST_CONTEXT_CONFIG_KEY = 'request-context-config';

export default registerAs(REQUEST_CONTEXT_CONFIG_KEY, () => {
  return {
    injectCID: process.env.INJECT_CID === 'true' || false,
  };
});
