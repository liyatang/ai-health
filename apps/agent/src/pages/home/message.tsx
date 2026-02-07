import { Markdown, Messages } from '@fe-free/ai';
import { useCallback, useMemo } from 'react';
import { useChatStore, welcomeMessage } from './store';
import type { Message } from './type';

function ChatMessages() {
  const messages = useChatStore((state) => state.messages);

  const handleRenderMessageOfAI = useCallback((props: { message: Message }) => {
    return (
      <div data-uuid={props.message.uuid} className="w-[960px] mx-auto max-w-full flex">
        <Markdown content={props.message.ai?.data?.content} />
      </div>
    );
  }, []);

  const handleRenderMessageOfUser = useCallback((props: { message: Message }) => {
    return (
      <div data-uuid={props.message.uuid} className="w-[960px] mx-auto max-w-full flex justify-end">
        <div className="bg-primary text-white rounded-lg px-3 py-2 ">
          {props.message.user?.text}
        </div>
      </div>
    );
  }, []);

  const handleRenderMessageOfSystem = useCallback((props: { message: Message }) => {
    return (
      <div data-uuid={props.message.uuid} className="w-[960px] mx-auto max-w-full flex">
        <Markdown content={props.message.system?.data?.content} />
      </div>
    );
  }, []);

  const newMessages = useMemo(() => {
    return [welcomeMessage, ...(messages ?? [])];
  }, [messages]);

  return (
    <Messages
      messages={newMessages}
      renderMessageOfSystem={handleRenderMessageOfSystem}
      renderMessageOfAI={handleRenderMessageOfAI}
      renderMessageOfUser={handleRenderMessageOfUser}
    />
  );
}

export { ChatMessages };
