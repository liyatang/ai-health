import { Sender } from '@fe-free/ai';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChatStore, useSendChatMessage } from './store/chat';
import { useConversationStore } from './store/conversation';

function ChatSender() {
  const senderValue = useChatStore((state) => state.senderValue);
  const setSenderValue = useChatStore((state) => state.setSenderValue);
  const contextData = useChatStore((state) => state.contextData);
  const { fetchData: fetchConversation } = useConversationStore();

  const [, setSearchParams] = useSearchParams();

  const handleChatIdChange = useCallback(
    (chatId: number) => {
      setSenderValue(undefined);

      // 如果当前对话id与新对话id不同，为新建情况
      if (contextData?.current_chat_id !== chatId) {
        // 更新 url
        setSearchParams({ chat_id: chatId.toString() });

        fetchConversation();
      }
    },
    [contextData?.current_chat_id, fetchConversation, setSearchParams, setSenderValue],
  );

  const { send } = useSendChatMessage({
    onChatIdChange: handleChatIdChange,
  });

  return (
    <div className="w-[960px] max-w-full mx-auto pb-2">
      <Sender value={senderValue} onChange={setSenderValue} onSubmit={send} />
    </div>
  );
}

export { ChatSender };
