import { customFetchStream } from '@/common/stream';
import { useGlobalStore } from '@/stores/global';
import type { SenderProps } from '@fe-free/ai';
import { createChatStore, EnumChatMessageStatus, EnumChatMessageType } from '@fe-free/ai';
import { EnumCodeType, EnumMessageRole, healthApi } from '@lib/api';
import type { ApiChatMessageRequest } from '@lib/api/src/request';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AIData, ChatContextData, Message, UserData } from './types';

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

function useSendChatMessage({ onChatIdChange }) {
  const messages = useChatStore((state) => state.messages);
  const contextData = useChatStore((state) => state.contextData);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const csrfToken = useGlobalStore((state) => state.csrfToken);

  const send = useCallback(
    async (value?: SenderProps['value']) => {
      const message: Message = {
        uuid: uuidv4(),
        status: EnumChatMessageStatus.PENDING,
        user: {
          text: value?.text ?? '',
        },
        ai: {
          data: {
            content: '',
          },
        },
      };
      addMessage(message);

      const sendMessages: ApiChatMessageRequest['messages'] = [];
      messages.forEach((message) => {
        sendMessages.push({
          role: EnumMessageRole.USER,
          content: message.user?.text ?? '',
        });
        sendMessages.push({
          role: EnumMessageRole.ASSISTANT,
          content: message.ai?.data?.content ?? '',
        });
      });
      sendMessages.push({
        role: EnumMessageRole.USER,
        content: message.user?.text ?? '',
      });
      const sendData = {
        messages: sendMessages,
        metadata: {
          code: EnumCodeType.Paid,
          health_form_id: contextData?.health_form_id,
          current_chat_id: contextData?.current_chat_id,
        },
      };

      async function afterSendSuccess() {
        sendMessages.push({
          role: EnumMessageRole.ASSISTANT,
          content: message.ai?.data?.content ?? '',
        });

        const res = await healthApi.chat.saveChatHistory({
          chat_id: contextData?.current_chat_id,
          csrf_token: csrfToken ?? '',
          health_form_id: contextData?.health_form_id,
          messages: sendMessages,
          // 用第一条消息作为标题
          title: sendMessages[0]?.content ?? '',
        });

        if (contextData?.current_chat_id !== res.data.chat_id) {
          onChatIdChange?.(res.data.chat_id);
        }
      }

      customFetchStream('/api/chat/message', {
        params: sendData,
        callbacks: {
          onUpdate: (chunk) => {
            if (chunk.message === '<stream_ended>') {
              message.status = EnumChatMessageStatus.DONE;

              updateMessage(message);

              afterSendSuccess();
            } else {
              message.status = EnumChatMessageStatus.STREAMING;
              message.ai!.data!.content += chunk.message;

              updateMessage(message);
            }
          },
          onError: (error) => {
            console.error('onError', error);
            message.status = EnumChatMessageStatus.ERROR;

            updateMessage(message);
          },
        },
      });
    },
    [
      addMessage,
      contextData?.current_chat_id,
      contextData?.health_form_id,
      csrfToken,
      messages,
      onChatIdChange,
      updateMessage,
    ],
  );

  return {
    send,
  };
}

export { useChatStore, useChatStoreComputed, useSendChatMessage, welcomeMessage };
