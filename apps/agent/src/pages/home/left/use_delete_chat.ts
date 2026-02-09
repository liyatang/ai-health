import { useGlobalStore } from '@/stores/global';
import { healthApi } from '@lib/api';
import { App } from 'antd';
import { useCallback } from 'react';
import type { ChatItem } from './use_conversation_list';

function useDeleteChat(options: { refresh: () => void }): { deleteChat: (chat: ChatItem) => void } {
  const { refresh } = options;
  const { modal, message } = App.useApp();
  const dashboard = useGlobalStore((state) => state.dashboard);

  const deleteChat = useCallback(
    (chat: ChatItem) => {
      modal.confirm({
        title: '删除对话',
        content: '确定删除该对话吗？',
        onOk: async () => {
          await healthApi.chat.deleteChatHistory({
            chat_id: chat.id,
            csrf_token: dashboard?.csrfToken ?? '',
          });
          message.success('删除成功');
          refresh();
        },
      });
    },
    [modal, message, dashboard?.csrfToken, refresh],
  );

  return { deleteChat };
}

export { useDeleteChat };
