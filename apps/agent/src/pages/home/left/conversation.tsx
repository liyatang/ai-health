import { useConversationStore, useConversationStoreComputed } from '@/stores/conversation';
import { MoreOutlined } from '@fe-free/icons';
import { Dropdown } from 'antd';
import classNames from 'classnames';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDeleteChat } from './use_delete_chat';
import { useRenameChat } from './use_rename_chat';

function Conversation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const chatId = searchParams.get('chat_id') ? Number(searchParams.get('chat_id')) : null;

  const { groupedConversations } = useConversationStoreComputed();
  const { fetchData: refresh } = useConversationStore();

  const { deleteChat } = useDeleteChat({ refresh });
  const { renameChat } = useRenameChat({ refresh });

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <div className="p-2 text-xs text-03">所有对话</div>
      <div className="flex flex-col">
        {groupedConversations.map(({ key, list }) => (
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
                <div
                  className="hidden group-hover:block"
                  onClick={(event) => event.stopPropagation()}
                >
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
                          onClick: () => {
                            deleteChat(chat);
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
