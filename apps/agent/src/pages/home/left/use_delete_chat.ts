import { useGlobalStore } from '@/stores/global';
import { healthApi } from '@lib/api';
import type { ApiSession } from '@lib/api/src/request';
import { App } from 'antd';
import { useCallback } from 'react';

function useDeleteChat(options: { refresh: () => void }): {
  deleteChat: (chat: ApiSession) => Promise<boolean>;
} {
  const { refresh } = options;
  const { modal, message } = App.useApp();
  const dashboard = useGlobalStore((state) => state.dashboard);

  const deleteChat = useCallback(
    async (chat: ApiSession) => {
      return new Promise<boolean>((resolve) => {
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

            resolve(true);
          },
          onCancel: () => {
            resolve(false);
          },
        });
      });
    },
    [modal, message, dashboard?.csrfToken, refresh],
  );

  return { deleteChat };
}

export { useDeleteChat };
