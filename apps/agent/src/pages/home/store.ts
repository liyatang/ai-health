import { createChatStore, EnumChatMessageType } from '@fe-free/ai';
import { v4 as uuidv4 } from 'uuid';
import type { AIData, ChatContextData, Message, UserData } from './type';

const welcomeMessage: Message = {
  uuid: uuidv4(),
  createdAt: new Date().getTime(),
  updatedAt: new Date().getTime(),
  type: EnumChatMessageType.SYSTEM,
  system: {
    data: {
      content:
        '你好，我是星辰.白泽类脑智能健康管理师，由世界顶尖大学临床营养，食品科学，医学和人工智能和脑科学专家联合研发，欢迎向我咨询。',
    },
  },
};

const { useChatStore, useChatStoreComputed } = createChatStore<UserData, AIData, ChatContextData>();

export { useChatStore, useChatStoreComputed, welcomeMessage };
