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

export interface ApiChatMessageRequest {
  messages: ApiChatMessage[];
  metadata: {
    code?: EnumCodeType;
    current_chat_id?: number;
    device_type?: string;
    health_form_id?: string;
    screen_height?: number;
    screen_width?: number;
    user_id?: string;
    user_name?: string;
  };
}

export interface ApiChatSaveChatHistoryRequest {
  chat_id?: string;
  csrf_token?: string;
  health_form_id?: string;
  messages: ApiChatMessage[];
  title?: string;
}
export interface ApiChatSaveChatHistoryResponse extends ApiResponse {
  chat_id: string;
}

export interface ApiChatLoadChatHistoryRequest {
  chat_id?: string;
}
export interface ApiChatLoadChatHistoryResponse extends ApiResponse {
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

export interface ApiChatDeleteChatHistoryRequest {
  chat_id: number;
  csrf_token: string;
}

export interface ApiChatRenameChatHistoryRequest {
  chat_id: number;
  csrf_token: string;
  new_title: string;
}

export class Api extends HttpClient {
  requestPost = <T = any>(path: string, param: any, params: RequestParams = {}) => {
    return this.request<T>({
      path: path,
      method: 'POST',
      body: param,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  };
  requestGet = <T = any>(path: string, query: any, params: RequestParams = {}) => {
    return this.request<T>({
      path: path,
      method: 'GET',
      format: 'json',
      query: query,
      ...params,
    });
  };
  chat = {
    renameChatHistory: (param: ApiChatRenameChatHistoryRequest, params: RequestParams = {}) =>
      this.requestPost<ApiResponse>('/rename_chat_history.php', param, params),
    deleteChatHistory: (param: ApiChatDeleteChatHistoryRequest, params: RequestParams = {}) =>
      this.requestPost<ApiResponse>('/delete_chat_history.php', param, params),
    saveChatHistory: (param: ApiChatSaveChatHistoryRequest, params: RequestParams = {}) =>
      this.requestPost<ApiChatSaveChatHistoryResponse>('/save_chat_history', param, params),
    loadChatHistory: (param?: ApiChatLoadChatHistoryRequest, params: RequestParams = {}) =>
      this.requestGet<ApiChatLoadChatHistoryResponse>('/load_chat_history.php', param, params),
  };
}
