import { healthApi } from '@lib/api';
import type { ApiChatSession } from '@lib/api/src/request';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { create } from 'zustand';

interface ConversationStore {
  conversations?: ApiChatSession[];
  setConversations: (conversations: ApiChatSession[]) => void;
  fetchData: () => void;
}
const useConversationStore = create<ConversationStore>((set) => ({
  conversations: undefined,
  setConversations: (conversations) => set({ conversations }),
  fetchData: async () => {
    const response = await healthApi.chat.loadChatHistory();
    set({ conversations: response.data.chats ?? [] });
  },
}));

const TIME_GROUP_ORDER = ['今天', '昨天', '过去7天', '更早'] as const;

function getTimeGroupKey(dateStr: string): (typeof TIME_GROUP_ORDER)[number] {
  const d = dayjs(dateStr);
  const now = dayjs();
  if (d.isSame(now, 'day')) return '今天';
  if (d.isSame(now.subtract(1, 'day'), 'day')) return '昨天';
  if (d.isAfter(now.subtract(7, 'day'))) return '过去7天';
  return '更早';
}

function useConversationStoreComputed() {
  const conversations = useConversationStore((state) => state.conversations);

  const groupedConversations = useMemo(() => {
    const sorted = [...(conversations ?? [])].sort(
      (a, b) => dayjs(b.updated_at).valueOf() - dayjs(a.updated_at).valueOf(),
    );
    const map = new Map<(typeof TIME_GROUP_ORDER)[number], ApiChatSession[]>();
    for (const key of TIME_GROUP_ORDER) {
      map.set(key, []);
    }
    for (const chat of sorted) {
      const key = getTimeGroupKey(chat.updated_at);
      map.get(key)?.push(chat);
    }
    return TIME_GROUP_ORDER.map((key) => ({ key, list: map.get(key) ?? [] })).filter(
      (g) => g.list.length > 0,
    );
  }, [conversations]);

  return {
    groupedConversations,
  };
}

export { useConversationStore, useConversationStoreComputed };
export type { ConversationStore };
