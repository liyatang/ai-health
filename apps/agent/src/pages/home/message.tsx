import { Welcome } from '@ant-design/x';
import { EnumChatMessageStatus, Markdown, Messages } from '@fe-free/ai';
import { LoadingOutlined } from '@fe-free/icons';
import { Avatar } from 'antd';
import classNames from 'classnames';
import { useCallback } from 'react';
import { useChatStore } from './store';
import type { Message } from './type';

function MessageWrap({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div className={classNames(' w-[960px] mx-auto max-w-full flex', className)}>{children}</div>
  );
}

function ChatMessages() {
  const messages = useChatStore((state) => state.messages);

  const handleRenderMessageOfAI = useCallback((props: { message: Message }) => {
    if (
      props.message.status === EnumChatMessageStatus.PENDING ||
      (props.message.status === EnumChatMessageStatus.STREAMING && !props.message.ai?.data?.content)
    ) {
      return (
        <MessageWrap data-uuid={props.message.uuid} className="c-message-system">
          <div>
            <LoadingOutlined spin /> 正在思考...
          </div>
        </MessageWrap>
      );
    }

    return (
      <div
        data-uuid={props.message.uuid}
        className="c-message-ai w-[960px] mx-auto max-w-full flex"
      >
        <Markdown content={props.message.ai?.data?.content} />
      </div>
    );
  }, []);

  const handleRenderMessageOfUser = useCallback((props: { message: Message }) => {
    return (
      <MessageWrap data-uuid={props.message.uuid} className="c-message-user justify-end">
        <div className="bg-primary text-white rounded-lg px-3 py-2">{props.message.user?.text}</div>
      </MessageWrap>
    );
  }, []);

  const handleRenderMessageOfSystem = useCallback((props: { message: Message }) => {
    return (
      <MessageWrap data-uuid={props.message.uuid} className="c-message-system">
        <Markdown content={props.message.system?.data?.content} />
      </MessageWrap>
    );
  }, []);

  // const newMessages = useMemo(() => {
  //   return [welcomeMessage, ...(messages ?? [])];
  // }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center w-[960px] mx-auto max-w-full">
        <Welcome
          variant="borderless"
          icon={<Avatar src="/logo.png" size={62} />}
          title="你好，我是星辰.白泽类脑智能健康管理师"
          description="由世界顶尖大学临床营养，食品科学，医学和人工智能和脑科学专家联合研发，欢迎向我咨询。"
        />
      </div>
    );
  }

  return (
    <Messages
      messages={messages}
      renderMessageOfSystem={handleRenderMessageOfSystem}
      renderMessageOfAI={handleRenderMessageOfAI}
      renderMessageOfUser={handleRenderMessageOfUser}
    />
  );
}

export { ChatMessages };
