/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 代理的后端 api 地址 */
  readonly VITE_PROXY_API_TARGET: string;
  // 更多环境变量...
}
