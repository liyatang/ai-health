import { useChatStore, useSendChatMessage } from '@/stores/chat';
import { useConversationStore } from '@/stores/conversation';
import { Sender } from '@fe-free/ai';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

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
        // 更新 url，新建情况标注 isAdd
        setSearchParams({ chat_id: chatId.toString(), isAdd: '1' });

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
