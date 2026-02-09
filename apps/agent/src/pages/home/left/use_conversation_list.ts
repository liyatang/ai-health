import { useGlobalRequest } from '@fe-free/core';
import { healthApi } from '@lib/api';
import dayjs from 'dayjs';
import { useMemo } from 'react';

const TIME_GROUP_ORDER = ['今天', '昨天', '过去7天', '更早'] as const;

function getTimeGroupKey(dateStr: string): (typeof TIME_GROUP_ORDER)[number] {
  const d = dayjs(dateStr);
  const now = dayjs();
  if (d.isSame(now, 'day')) return '今天';
  if (d.isSame(now.subtract(1, 'day'), 'day')) return '昨天';
  if (d.isAfter(now.subtract(7, 'day'))) return '过去7天';
  return '更早';
}

export type ChatItem = { id: number; title: string; created_at: string };

type GroupedItem = { key: (typeof TIME_GROUP_ORDER)[number]; list: ChatItem[] };

function useConversationList(): {
  groupedChats: GroupedItem[];
  refresh: () => void;
} {
  const { data: res, refresh } = useGlobalRequest(async () => {
    const response = await healthApi.chat.loadChatHistory();
    return response.data;
  });

  const groupedChats = useMemo(() => {
    const chats = (res?.chats ?? []) as ChatItem[];
    const sorted = [...chats].sort(
      (a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf(),
    );
    const map = new Map<(typeof TIME_GROUP_ORDER)[number], ChatItem[]>();
    for (const key of TIME_GROUP_ORDER) {
      map.set(key, []);
    }
    for (const chat of sorted) {
      const key = getTimeGroupKey(chat.created_at);
      map.get(key)?.push(chat);
    }
    return TIME_GROUP_ORDER.map((key) => ({ key, list: map.get(key) ?? [] })).filter(
      (g) => g.list.length > 0,
    );
  }, [res?.chats]);

  return { groupedChats, refresh };
}

export { useConversationList };
