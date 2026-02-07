import { injectInterceptors } from './interceptors';
import { Api as HealthApi } from './request';

const baseURL = '/api';

const healthApi = new HealthApi({
  baseURL,
});

injectInterceptors(healthApi.instance);

export * from './code/enums';
export * from './error';

export { baseURL, healthApi };
