import type { Message } from '@/stores/chat';
import { Copy } from '@fe-free/core';
import { CameraOutlined, CopyOutlined } from '@fe-free/icons';
import { App, Button } from 'antd';
import html2canvas from 'html2canvas';
import { useCallback, useRef } from 'react';

export const MESSAGE_CONTENT_CLASS = 'c-message-content';
export const MESSAGE_GROUP_CLASS = 'c-message-group';

/** 将 DOM 元素截图为 PNG 并触发下载 */
async function captureElementAsImage(
  element: HTMLElement,
  filename: string,
  options?: { scale?: number; backgroundColor?: string },
) {
  const canvas = await html2canvas(element, {
    useCORS: true,
    scale: options?.scale ?? 2,
    backgroundColor: options?.backgroundColor ?? '#ffffff',
    logging: false,
  });
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/** 根据事件与选择器查找目标元素并截图的通用 hook */
function useElementScreenshot<T>(options: {
  groupSelector: string;
  contentSelector: string;
  getFilename: (context: T) => string;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}): (e: React.MouseEvent, context: T) => void {
  const groupSel = options.groupSelector.startsWith('.')
    ? options.groupSelector
    : `.${options.groupSelector}`;
  const contentSel = options.contentSelector.startsWith('.')
    ? options.contentSelector
    : `.${options.contentSelector}`;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  return useCallback(
    (e, context) => {
      const group = (e.currentTarget as HTMLElement).closest(groupSel);
      const content = group?.querySelector(contentSel) as HTMLElement | null;
      if (!content) return;

      const { getFilename, onSuccess, onError } = optionsRef.current;
      captureElementAsImage(content, getFilename(context))
        .then(() => onSuccess?.())
        .catch((err) => onError?.(err));
    },
    [groupSel, contentSel],
  );
}

function ScreenshotButton({ uuid }: { uuid: string }) {
  const { message } = App.useApp();

  const handleScreenshot = useElementScreenshot<string>({
    groupSelector: MESSAGE_GROUP_CLASS,
    contentSelector: MESSAGE_CONTENT_CLASS,
    getFilename: (messageId) => `message-${messageId}`,
    onSuccess: () => message.success('截图已保存'),
    onError: () => message.error('截图失败'),
  });

  return (
    <Button
      type="text"
      size="small"
      onClick={(e) => handleScreenshot(e, uuid)}
      icon={<CameraOutlined className="!text-lg" />}
    />
  );
}

function CopyButton({ value }: { value: string }) {
  return (
    <Copy value={value}>
      <Button size="small" icon={<CopyOutlined className="!text-lg" />} type="text" />
    </Copy>
  );
}

export function MessageToolBarAI({ message }: { message: Message }) {
  return (
    <div className="flex items-center gap-1">
      <CopyButton value={message.ai?.data?.content ?? ''} />
      <ScreenshotButton uuid={message.uuid} />
    </div>
  );
}

export function MessageToolBarUser({ message }: { message: Message }) {
  return (
    <div className="flex items-center gap-1">
      <CopyButton value={message.user?.text ?? ''} />
      <ScreenshotButton uuid={message.uuid} />
    </div>
  );
}
