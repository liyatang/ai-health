import type { SenderProps } from '@fe-free/ai';
import { Sender } from '@fe-free/ai';
import { EnumCodeType, EnumMessageRole } from '@lib/api';
import type { ApiChatMessageRequest } from '@lib/api/src/request';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from './store';
import { fetchStream } from './stream';
import type { Message } from './type';

function useSendData() {
  const messages = useChatStore((state) => state.messages);
  const contextData = useChatStore((state) => state.contextData);

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

  function getSendData(message: Message) {
    return {
      messages: [
        ...sendMessages,
        {
          role: EnumMessageRole.USER,
          content: message.user?.text ?? '',
        },
      ],
      metadata: {
        code: EnumCodeType.Paid,
        health_form_id: contextData?.health_form_id,
        current_chat_id: contextData?.current_chat_id,
      },
    };
  }

  return {
    getSendData,
  };
}

function ChatSender() {
  const senderValue = useChatStore((state) => state.senderValue);
  const setSenderValue = useChatStore((state) => state.setSenderValue);
  const addMessage = useChatStore((state) => state.addMessage);

  const { getSendData } = useSendData();

  const handleSubmit = useCallback(
    async (value?: SenderProps['value']) => {
      const message: Message = {
        uuid: uuidv4(),
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        user: {
          text: value?.text ?? '',
        },
      };
      addMessage(message);

      const sendData = getSendData(message);

      fetchStream('/chat/message', {
        params: sendData,
        callbacks: {
          onUpdate: (chunk) => {
            console.log('onUpdate', chunk);
          },
          onError: (error) => {
            console.error('onError', error);
          },
        },
      });
    },
    [addMessage, getSendData],
  );

  return (
    <div className=" w-[960px] max-w-full mx-auto">
      <Sender value={senderValue} onChange={setSenderValue} onSubmit={handleSubmit} />
    </div>
  );
}

export { ChatSender };
