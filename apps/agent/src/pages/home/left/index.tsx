import { useGlobalStore } from '@/stores/global';
import { PageLayout } from '@fe-free/core';
import { PlusOutlined } from '@fe-free/icons';
import { Avatar, Button } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { Conversation } from './conversation';

function Left() {
  const [, setSearchParams] = useSearchParams();
  const userInfo = useGlobalStore((state) => state.userInfo);

  return (
    <PageLayout
      direction="vertical"
      className="!w-[220px] bg-01 p-2"
      start={
        <>
          <div className="flex items-center gap-2 mb-4">
            <Avatar src="/logo.png" />
            <div className="text-lg">星辰.白泽类脑智能</div>
          </div>
          <Button
            type="text"
            onClick={() => {
              setSearchParams({ chat_id: '' });
            }}
            className="px-2 w-full"
          >
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 text-left">新建对话</div>
              <PlusOutlined />
            </div>
          </Button>
          <div className="border-b border-01 my-2" />
        </>
      }
      endClassName="border-t border-01 pt-2"
      end={<div>{userInfo?.name}</div>}
    >
      <Conversation />
    </PageLayout>
  );
}

export { Left };
