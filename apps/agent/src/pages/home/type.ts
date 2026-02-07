import type { ChatMessage } from '@fe-free/ai';

interface UserData {
  text?: string;
}

interface AIData {
  content?: string;
}

type Message = ChatMessage<UserData, AIData>;

interface ChatContextData {
  current_chat_id?: number;
  health_form_id?: string;
}

export type { AIData, ChatContextData, Message, UserData };
