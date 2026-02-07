import { useGlobalRequest } from '@fe-free/core';
import { MoreOutlined } from '@fe-free/icons';
import { healthApi } from '@lib/api';
import { Dropdown } from 'antd';
import classNames from 'classnames';
import { useSearchParams } from 'react-router-dom';

function Left() {
  const [searchParams, setSearchParams] = useSearchParams();

  const chatId = searchParams.get('chat_id') ? Number(searchParams.get('chat_id')) : null;

  const { data: res } = useGlobalRequest(async () => {
    const response = await healthApi.chat.loadChatHistory();
    return response.data;
  });

  return (
    <div className="w-[250px] bg-01 p-2">
      <div className="flex flex-col">
        {(res?.chats ?? []).map((chat) => (
          <div
            key={chat.id}
            className={classNames('rounded-lg p-2 hover:bg-03 flex gap-1 cursor-pointer group', {
              'bg-03': chatId === chat.id,
            })}
            onClick={() => {
              setSearchParams({ chat_id: chat.id.toString() ?? '' });
            }}
          >
            <div className="flex-1 truncate">{chat.title}</div>
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
                        alert('删除');
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
    </div>
  );
}

export { Left };
