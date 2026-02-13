import {
  useChatStore,
  useChatStoreComputed,
  useSendChatMessage,
  type Message,
} from '@/stores/chat';
import { EnumChatMessageStatus } from '@fe-free/ai';
import { Copy } from '@fe-free/core';
import { CameraOutlined, CopyOutlined, EditOutlined } from '@fe-free/icons';
import { App, Button, Input, Modal } from 'antd';
import html2canvas from 'html2canvas';
import { useCallback, useRef, useState } from 'react';

export const MESSAGE_CONTENT_CLASS = 'c-message-content';
export const MESSAGE_GROUP_CLASS = 'c-message-group';

const SCREENSHOT_OUTER_MARGIN = 8; // 黑色背景与白色内容区之间的边距
const SCREENSHOT_INNER_PADDING = 8; // 白色内容区内部边距
const SCREENSHOT_BORDER_RADIUS = 8; // 白色内容区圆角

/** 将 DOM 元素截图为 PNG 并触发下载（黑色外底、白底内容区、边距与圆角） */
async function captureElementAsImage(
  element: HTMLElement,
  filename: string,
  options?: { scale?: number; backgroundColor?: string },
) {
  const scale = options?.scale ?? 2;
  const contentBg = options?.backgroundColor ?? '#ffffff';

  const canvas = await html2canvas(element, {
    useCORS: true,
    scale,
    backgroundColor: contentBg,
    logging: false,
  });

  const w = canvas.width;
  const h = canvas.height;
  const outerM = SCREENSHOT_OUTER_MARGIN * scale;
  const innerP = SCREENSHOT_INNER_PADDING * scale;
  const radius = SCREENSHOT_BORDER_RADIUS * scale;
  const whiteW = w + innerP * 2;
  const whiteH = h + innerP * 2;
  const outW = whiteW + outerM * 2;
  const outH = whiteH + outerM * 2;

  const out = document.createElement('canvas');
  out.width = outW;
  out.height = outH;
  const ctx = out.getContext('2d')!;

  // 1. 黑色背景铺满
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, outW, outH);

  // 2. 白色内容区（圆角矩形），再在内部画内容
  ctx.save();
  const whitePath = new Path2D();
  whitePath.roundRect(outerM, outerM, whiteW, whiteH, radius);
  ctx.clip(whitePath);
  ctx.fillStyle = contentBg;
  ctx.fillRect(outerM, outerM, whiteW, whiteH);
  ctx.drawImage(canvas, outerM + innerP, outerM + innerP, w, h);
  ctx.restore();

  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = out.toDataURL('image/png');
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

function EditButton({ message }: { message: Message }) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);

  const messages = useChatStore((state) => state.messages);
  const setMessages = useChatStore((state) => state.setMessages);

  const { send } = useSendChatMessage({});

  return (
    <>
      <Button
        size="small"
        icon={<EditOutlined className="!text-lg" />}
        type="text"
        onClick={() => {
          setValue(message.ai?.data?.content ?? '');
          setOpen(true);
        }}
      />
      {open && (
        <Modal
          onCancel={() => setOpen(false)}
          onOk={() => {
            setOpen(false);

            const index = messages.findIndex((m) => m.uuid === message.uuid);

            if (index !== -1) {
              // 移除当前和后面的消息
              setMessages(messages.slice(0, index));
              // 重新发送
              send({ text: value });
            }
          }}
        >
          <Input.TextArea value={value} onChange={(e) => setValue(e.target.value)} />
        </Modal>
      )}
    </>
  );
}

export function MessageToolBarAI({ message }: { message: Message }) {
  const { chatStatus } = useChatStoreComputed();

  if (
    chatStatus === EnumChatMessageStatus.PENDING ||
    chatStatus === EnumChatMessageStatus.STREAMING
  ) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <CopyButton value={message.ai?.data?.content ?? ''} />
      <ScreenshotButton uuid={message.uuid} />
    </div>
  );
}

export function MessageToolBarUser({ message }: { message: Message }) {
  const { chatStatus } = useChatStoreComputed();

  if (
    chatStatus === EnumChatMessageStatus.PENDING ||
    chatStatus === EnumChatMessageStatus.STREAMING
  ) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <CopyButton value={message.user?.text ?? ''} />
      <ScreenshotButton uuid={message.uuid} />
      <EditButton message={message} />
    </div>
  );
}
