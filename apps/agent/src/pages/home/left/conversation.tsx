import { useGlobalStore } from '@/stores/global';
import { useGlobalRequest } from '@fe-free/core';
import { MoreOutlined } from '@fe-free/icons';
import { healthApi } from '@lib/api';
import { App, Dropdown } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const TIME_GROUP_ORDER = ['今天', '昨天', '过去7天', '更早'] as const;

function getTimeGroupKey(dateStr: string): (typeof TIME_GROUP_ORDER)[number] {
  const d = dayjs(dateStr);
  const now = dayjs();
  if (d.isSame(now, 'day')) return '今天';
  if (d.isSame(now.subtract(1, 'day'), 'day')) return '昨天';
  if (d.isAfter(now.subtract(7, 'day'))) return '过去7天';
  return '更早';
}

type ChatItem = { id: number; title: string; created_at: string };

function Conversation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { modal, message } = App.useApp();

  const dashboard = useGlobalStore((state) => state.dashboard);

  const chatId = searchParams.get('chat_id') ? Number(searchParams.get('chat_id')) : null;

  const { data: res, refresh } = useGlobalRequest(async () => {
    const response = await healthApi.chat.loadChatHistory();
    return response.data;
  });

  const groupedChats = useMemo(() => {
    const chats = (res?.chats ?? []) as ChatItem[];
    const sorted = [...chats].sort(
      (a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf(),
    );
    const map = new Map<(typeof TIME_GROUP_ORDER)[number], ChatItem[]>();
    for (const key of TIME_GROUP_ORDER) {
      map.set(key, []);
    }
    for (const chat of sorted) {
      const key = getTimeGroupKey(chat.created_at);
      map.get(key)?.push(chat);
    }
    return TIME_GROUP_ORDER.map((key) => ({ key, list: map.get(key) ?? [] })).filter(
      (g) => g.list.length > 0,
    );
  }, [res?.chats]);

  return (
    <div>
      <div className="p-2 text-xs text-03">所有对话</div>
      <div className="flex flex-col">
        {groupedChats.map(({ key, list }) => (
          <div key={key}>
            <div className="px-2 pt-3 pb-1 text-xs text-03">{key}</div>
            {list.map((chat) => (
              <div
                key={chat.id}
                className={classNames(
                  'rounded-lg px-2 py-1.5 hover:bg-03 flex gap-1 cursor-pointer group',
                  {
                    'bg-03': chatId === chat.id,
                  },
                )}
                onClick={() => {
                  setSearchParams({ chat_id: chat.id.toString() ?? '' });
                }}
              >
                <div className="flex-1">
                  <div className="truncate">{chat.title}</div>
                </div>
                <div className="hidden group-hover:block">
                  <Dropdown
                    menu={{
                      items: [
                        {
                          label: '重命名',
                          key: 'rename',
                          onClick: () => {
                            alert('重命名');
                          },
                        },
                        {
                          label: '删除',
                          key: 'delete',
                          onClick: () => {
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
                        },
                      ],
                    }}
                    placement="bottomRight"
                  >
                    <MoreOutlined />
                  </Dropdown>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export { Conversation };
