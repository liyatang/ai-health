import { Sender } from '@fe-free/ai';
import { useChatStore } from './store';

function ChatSender() {
  const senderValue = useChatStore((state) => state.senderValue);
  const setSenderValue = useChatStore((state) => state.setSenderValue);

  return (
    <div className="p-2 w-[960px] max-w-full mx-auto">
      <Sender value={senderValue} onChange={setSenderValue} />
    </div>
  );
}

export { ChatSender };
