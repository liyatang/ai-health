import { chatMessagesToApiChatMessages, useChatStore } from '@/stores/chat';
import { Copy } from '@fe-free/core';
import { CopyOutlined } from '@fe-free/icons';
import { EnumMessageRole } from '@lib/api';
import { App, Button } from 'antd';
import { useCallback, useMemo } from 'react';
import { HealthForm } from '../health_form';

function messagesToCopyText(messages: Array<{ role: string; content: string }>): string {
  return messages
    .map((m) => {
      const label = m.role === EnumMessageRole.USER ? '问' : '答';
      return `${label}：\n${m.content.trim()}`;
    })
    .join('\n\n');
}

function Header() {
  const { message } = App.useApp();
  const messages = useChatStore((state) => state.messages);

  const value = useMemo(() => {
    const apiMessages = chatMessagesToApiChatMessages(messages);
    return messagesToCopyText(apiMessages);
  }, [messages]);

  const onCopied = useCallback(() => {
    message.success('复制成功');
  }, [message]);

  return (
    <div className="px-4 flex items-center h-[50px] gap-2">
      <HealthForm />
      <div className="flex-1" />
      <div>
        <Copy value={value} onCopied={onCopied}>
          <Button icon={<CopyOutlined />} type="text">
            复制聊天记录
          </Button>
        </Copy>
      </div>
    </div>
  );
}

export { Header };
