import { useConversationStore, useConversationStoreComputed } from '@/stores/conversation';
import { useGlobalStore } from '@/stores/global';
import { PageLayout } from '@fe-free/core';
import { MoreOutlined } from '@fe-free/icons';
import type { ApiChatSession } from '@lib/api/src/request';
import { Dropdown } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDeleteChat } from './use_delete_chat';
import { useRenameChat } from './use_rename_chat';

function Item({ chat, refresh }: { chat: ApiChatSession; refresh: () => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const chatId = searchParams.get('chat_id') ? Number(searchParams.get('chat_id')) : null;

  const healthForms = useGlobalStore((state) => state.healthForms);

  const { deleteChat } = useDeleteChat({ refresh });
  const { renameChat } = useRenameChat({ refresh });

  const formName = useMemo(() => {
    return healthForms?.find((item) => item.id === chat.health_form_id)?.name;
  }, [healthForms, chat.health_form_id]);

  return (
    <div
      key={chat.id}
      className={classNames('rounded-lg px-2 py-1.5 hover:bg-03 flex gap-1 cursor-pointer group', {
        'bg-03': chatId === chat.id,
      })}
      onClick={() => {
        setSearchParams({ chat_id: chat.id.toString() ?? '' });
      }}
    >
      <div className="flex-1 max-w-full">
        <div className="truncate">{chat.title}</div>
        <div className="flex items-center gap-1">
          <div className="text-xs text-03">{dayjs(chat.updated_at).format('MM-DD HH:mm')}</div>
          {formName && (
            <div className="text-primary bg-theme05 rounded-lg text-xs  px-1 py-0.5">
              {formName}
            </div>
          )}
        </div>
      </div>
      <div className="hidden group-hover:block" onClick={(event) => event.stopPropagation()}>
        <Dropdown
          menu={{
            items: [
              {
                label: '重命名',
                key: 'rename',
                onClick: () => {
                  renameChat(chat);
                },
              },
              {
                label: '删除',
                key: 'delete',
                onClick: async () => {
                  const result = await deleteChat(chat);
                  if (result) {
                    // 如果删除的是当前的对话，则清空 url 中的 chat_id
                    if (chatId === chat.id) {
                      setSearchParams({ chat_id: '' });
                    }
                  }
                },
              },
            ],
          }}
        >
          <MoreOutlined />
        </Dropdown>
      </div>
    </div>
  );
}

function Conversation() {
  const { groupedConversations } = useConversationStoreComputed();
  const { fetchData: refresh } = useConversationStore();

  useEffect(() => {
    refresh();
  }, []);

  return (
    <PageLayout direction="vertical" start={<div className="p-2 text-xs text-03">所有对话</div>}>
      <div className="flex flex-col">
        {groupedConversations.map(({ key, list }) => (
          <div key={key}>
            <div className="px-2 pt-3 pb-1 text-xs text-03">{key}</div>
            {list.map((chat) => (
              <Item key={chat.id} chat={chat} refresh={refresh} />
            ))}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

export { Conversation };
