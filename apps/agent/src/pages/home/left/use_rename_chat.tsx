import { useGlobalStore } from '@/stores/global';
import { healthApi } from '@lib/api';
import type { ApiChatSession } from '@lib/api/src/request';
import { App, Input } from 'antd';
import { useCallback, useRef } from 'react';

function useRenameChat(options: { refresh: () => void }): {
  renameChat: (chat: ApiChatSession) => void;
} {
  const { refresh } = options;
  const { modal, message } = App.useApp();
  const csrfToken = useGlobalStore((state) => state.csrfToken);
  const titleRef = useRef({ value: '' });

  const renameChat = useCallback(
    (chat: ApiChatSession) => {
      titleRef.current.value = chat.title;
      modal.confirm({
        title: '重命名',
        content: (
          <Input
            defaultValue={chat.title}
            placeholder="请输入新标题"
            onChange={(e) => {
              titleRef.current.value = e.target.value;
            }}
          />
        ),
        onOk: async () => {
          const newTitle = titleRef.current.value?.trim();
          if (!newTitle) {
            message.warning('请输入新标题');
            return Promise.reject();
          }
          await healthApi.chat.renameChatHistory({
            chat_id: chat.id,
            csrf_token: csrfToken ?? '',
            new_title: newTitle,
          });
          message.success('重命名成功');
          refresh();
        },
      });
    },
    [modal, message, csrfToken, refresh],
  );

  return { renameChat };
}

export { useRenameChat };
