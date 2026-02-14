import type { Message } from '@/stores/chat';
import { useChatStore } from '@/stores/chat';
import { Chat } from '@fe-free/ai';
import { PageLayout, useGlobalRequest } from '@fe-free/core';
import { EnumMessageRole, healthApi } from '@lib/api';
import { usePrevious, useUpdateEffect } from 'ahooks';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Header } from './header';
import { Left } from './left';
import { ChatMessages } from './messages';
import { ChatSender } from './sender';

function useHistory({ chatId }: { chatId?: number }) {
  const setMessagesBefore = useChatStore((state) => state.setMessagesBefore);

  const { data: res, refreshAsync } = useGlobalRequest(
    async () => {
      const response = await healthApi.chat.loadChatHistory(
        chatId ? { chat_id: chatId } : undefined,
      );
      return response.data;
    },
    {
      refreshDeps: [chatId],
      manual: true,
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

  return {
    refreshAsync,
  };
}

function WrapChat() {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chat_id') ? Number(searchParams.get('chat_id')) : undefined;

  const [init, setInit] = useState(false);

  const reset = useChatStore((state) => state.reset);
  const setContextData = useChatStore((state) => state.setContextData);
  const setContextDataWithField = useChatStore((state) => state.setContextDataWithField);

  const { refreshAsync: refreshHistoryAsync } = useHistory({ chatId });

  useEffect(() => {
    (async function init() {
      // 重置
      reset();

      // 加载好历史记录
      const res = await refreshHistoryAsync();

      // 设置 contextData
      setContextData({
        current_chat_id: chatId,
        health_form_id: res.chat?.health_form_id,
      });

      console.log('res', res);

      // 初始化完成
      setInit(true);
    })();
  }, []);

  useUpdateEffect(() => {
    // 目前只有新建的情况。
    // 如果当前对话id有变化，设置 contextData
    setContextDataWithField('current_chat_id', chatId);
  }, [chatId, setContextDataWithField]);

  if (!init) {
    return null;
  }

  return (
    <Chat end={<ChatSender />} childrenClassName="py-2">
      <ChatMessages />
    </Chat>
  );
}

function HomePage() {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chat_id') ? Number(searchParams.get('chat_id')) : undefined;
  const isAdd = searchParams.get('isAdd') === '1' ? true : false;

  const preChatId = usePrevious(chatId);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (chatId !== preChatId) {
      // 新建情况不管
      if (isAdd) {
        // nothing
      } else {
        // change key
        setKey((key) => key + 1);
      }
    }
  }, [chatId, preChatId, isAdd]);

  return (
    <PageLayout
      className="bg-01"
      start={<Left />}
      startClassName="border-r border-01"
      childrenClassName="bg-white"
    >
      <PageLayout direction="vertical" start={<Header />} startClassName="border-b border-01">
        <WrapChat key={key} />
      </PageLayout>
    </PageLayout>
  );
}

export default HomePage;
