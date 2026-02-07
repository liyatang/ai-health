import type { AxiosInstance } from 'axios';
// @ts-ignore
import { globalConfig } from '@/config';
import { RequestError } from '@fe-free/core';

export function injectInterceptors(instance: AxiosInstance) {
  instance.interceptors.response.use(
    async function (response) {
      const { config, data, request, status } = response;

      // 正常
      if (data.success) {
        return response;
      }

      if (data.error && data.error == 'Not authenticated') {
        window.location.href = `${globalConfig.basename}/login`;
      }

      throw new RequestError(response.data.error || '服务器异常', {
        config,
        status,
        request,
        response,
      });
    },
    function (error) {
      const { config, status, request, response, message } = error;

      throw new RequestError(message || '服务器异常', {
        config,
        status,
        request,
        response,
      });
    },
  );
}
