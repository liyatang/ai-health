import { Chat } from '@fe-free/ai';
import { PageLayout, useGlobalRequest } from '@fe-free/core';
import { EnumMessageRole, healthApi } from '@lib/api';
import { usePrevious, useUpdateEffect } from 'ahooks';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Left } from './left';
import { ChatMessages } from './message';
import { ChatSender } from './sender';
import { useChatStore } from './store';
import type { Message } from './type';

function useHistory({ chatId }: { chatId?: number }) {
  const setMessagesBefore = useChatStore((state) => state.setMessagesBefore);

  const { data: res } = useGlobalRequest(
    async () => {
      const response = await healthApi.chat.loadChatHistory(
        chatId ? { chat_id: chatId.toString() } : undefined,
      );
      return response.data;
    },
    {
      refreshDeps: [chatId],
      manual: !chatId,
    },
  );

  useEffect(() => {
    const messages: Message[] = [];
    let message: Message | undefined;

    (res?.chat?.messages ?? []).forEach((item) => {
      if (item.role === EnumMessageRole.USER) {
        message = {
          uuid: uuidv4(),
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
          user: {
            text: item.content,
          },
        };
      } else if (item.role === EnumMessageRole.ASSISTANT) {
        if (message) {
          message.ai = {
            data: {
              ...item,
            },
          };
          messages.push(message);
        }
      }
    });

    setMessagesBefore(messages);
  }, [res, setMessagesBefore]);
}

function WrapChat() {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chat_id') ? Number(searchParams.get('chat_id')) : undefined;

  const [init, setInit] = useState(false);

  const reset = useChatStore((state) => state.reset);
  const setContextDataWithField = useChatStore((state) => state.setContextDataWithField);

  useHistory({ chatId });

  useEffect(() => {
    reset();
    setContextDataWithField('current_chat_id', chatId);

    setInit(true);
  }, []);

  useUpdateEffect(() => {
    setContextDataWithField('current_chat_id', chatId);
  }, [chatId, setContextDataWithField]);

  const chatKey = useMemo(() => {
    return chatId;
  }, [chatId]);

  if (!init) {
    return null;
  }

  return (
    <Chat key={chatKey} end={<ChatSender />} childrenClassName="py-2">
      <ChatMessages />
    </Chat>
  );
}

function HomePage() {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chat_id') ? Number(searchParams.get('chat_id')) : undefined;

  const preChatId = usePrevious(chatId);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!preChatId && chatId !== preChatId) {
      // not change
    } else if (preChatId !== chatId) {
      setKey((key) => key + 1);
    }
  }, [chatId, preChatId]);

  return (
    <PageLayout
      className="bg-01 py-2 pr-2"
      start={<Left />}
      childrenClassName="bg-white rounded-lg"
    >
      <WrapChat key={key} />
    </PageLayout>
  );
}

export default HomePage;
