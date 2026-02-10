import { useGlobalStore } from '@/stores/global';
import { healthApi } from '@lib/api';
import type { ApiChatSession } from '@lib/api/src/request';
import { App } from 'antd';
import { useCallback } from 'react';

function useDeleteChat(options: { refresh: () => void }): {
  deleteChat: (chat: ApiChatSession) => Promise<boolean>;
} {
  const { refresh } = options;
  const { modal, message } = App.useApp();
  const csrfToken = useGlobalStore((state) => state.csrfToken);

  const deleteChat = useCallback(
    async (chat: ApiChatSession) => {
      return new Promise<boolean>((resolve) => {
        modal.confirm({
          title: '删除对话',
          content: '确定删除该对话吗？',
          onOk: async () => {
            await healthApi.chat.deleteChatHistory({
              chat_id: chat.id,
              csrf_token: csrfToken ?? '',
            });
            message.success('删除成功');
            refresh();

            resolve(true);
          },
          onCancel: () => {
            resolve(false);
          },
        });
      });
    },
    [modal, message, csrfToken, refresh],
  );

  return { deleteChat };
}

export { useDeleteChat };
