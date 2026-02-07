import { Chat } from '@fe-free/ai';
import { PageLayout, useGlobalRequest } from '@fe-free/core';
import { EnumMessageRole, healthApi } from '@lib/api';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Left } from './left';
import { ChatMessages } from './message';
import { ChatSender } from './sender';
import { useChatStore } from './store';
import type { Message } from './type';

function useHistory() {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chat_id') ? Number(searchParams.get('chat_id')) : null;

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

function HomePage() {
  useHistory();

  return (
    <PageLayout className="bg-01 p-1" start={<Left />} childrenClassName="bg-white rounded-lg px-2">
      <Chat end={<ChatSender />} childrenClassName="py-2">
        <ChatMessages />
      </Chat>
    </PageLayout>
  );
}

export default HomePage;
