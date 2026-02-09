import { PlusOutlined } from '@fe-free/icons';
import { Avatar, Button } from 'antd';
import { Conversation } from './conversation';

function Left() {
  return (
    <div className="w-[220px] bg-01 p-2">
      <div className="flex items-center gap-2 mb-4">
        <Avatar src="/logo.png" />
        <div className="text-lg">星辰.白泽类脑智能</div>
      </div>
      <Button
        type="text"
        onClick={() => {
          alert('新建对话');
        }}
        className="px-2 w-full"
      >
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 text-left">新建对话</div>
          <PlusOutlined />
        </div>
      </Button>
      <div className="border-b border-01 my-2" />
      <Conversation />
    </div>
  );
}

export { Left };
