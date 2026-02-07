import type { EnumCodeType, EnumMessageRole } from '../code/enums';
import type { RequestParams } from './helper';
import { ContentType, HttpClient } from './helper';

interface ApiResponse {
  success: boolean;
  error?: string;
}

interface ApiChatMessage {
  content: string;
  role: EnumMessageRole;
}

interface ApiChatMessageRequest {
  message?: ApiChatMessage[];
  metadata: {
    code?: EnumCodeType;
    current_chat_id?: string;
    device_type?: string;
    health_form_id?: string;
    screen_height?: number;
    screen_width?: number;
    user_id?: string;
    user_name?: string;
  };
}

interface ApiChatSaveChatHistoryRequest {
  chat_id?: string;
  csrf_token?: string;
  health_form_id?: string;
  messages: ApiChatMessage[];
  title?: string;
}
interface ApiChatSaveChatHistoryResponse {
  chat_id: string;
}

interface ApiChatLoadChatHistoryRequest {
  chat_id?: string;
}
interface ApiChatLoadChatHistoryResponse {
  chats?: {
    created_at: string;
    health_form_id?: string;
    id: number;
    title: string;
    updated_at: string;
  }[];
  chat?: {
    created_at: string;
    health_form_id?: string;
    id: number;
    title: string;
    updated_at: string;
    messages: ApiChatMessage[];
  };
}

export class Api extends HttpClient {
  requestPost = <T = any>(path: string, param: any, params: RequestParams = {}) => {
    return this.request<T & ApiResponse>({
      path: path,
      method: 'POST',
      body: param,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  };
  requestGet = <T = any>(path: string, query: any, params: RequestParams = {}) => {
    return this.request<T & ApiResponse>({
      path: path,
      method: 'GET',
      format: 'json',
      query: query,
      ...params,
    });
  };
  chat = {
    message: (param: ApiChatMessageRequest, params: RequestParams = {}) =>
      this.requestPost('/api', param, params),
    saveChatHistory: (param: ApiChatSaveChatHistoryRequest, params: RequestParams = {}) =>
      this.requestPost<ApiChatSaveChatHistoryResponse>('/save_chat_history', param, params),
    loadChatHistory: (param?: ApiChatLoadChatHistoryRequest, params: RequestParams = {}) =>
      this.requestGet<ApiChatLoadChatHistoryResponse>('/load_chat_history.php', param, params),
  };
}
