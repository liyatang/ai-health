import type { ApiHealthForm } from '@lib/api/src/request';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface GlobalState {
  init: boolean;
  doInit: (silent?: boolean) => Promise<void>;

  csrfToken?: string;
  currentHealthFormId?: string;
  healthForms?: ApiHealthForm[];
  userInfo?: {
    id: string;
    name: string;
  };
  /** 从 dashboard HTML 中解析值 */
  fetchDashboard: () => Promise<void>;

  menuCollapse: boolean;
  setMenuCollapse: (collapse?: boolean) => void;
}

const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      init: false,
      doInit: async () => {
        await get().fetchDashboard();
        set({ init: true });
      },

      menuCollapse: false,
      setMenuCollapse: (collapse?: boolean) =>
        set((state) => {
          // 如果提供则使用，不提供则 toggle
          return { menuCollapse: collapse ?? !state.menuCollapse };
        }),

      dashboard: undefined,
      /** 从 dashboard 的 HTML 中解析 window.csrfToken */
      fetchDashboard: async (): Promise<void> => {
        const response = await fetch('/api/dashboard.php');
        const html = await response.text();

        return new Promise<void>((resolve) => {
          const iframe = document.createElement('iframe');
          iframe.srcdoc = html;
          iframe.style.display = 'none';
          document.body.appendChild(iframe);

          iframe.onload = () => {
            set({
              userInfo: {
                // @ts-ignore
                id: iframe.contentWindow?.phpUserId,
                // @ts-ignore
                name: iframe.contentWindow?.phpUserName,
              },
              // @ts-ignore
              csrfToken: iframe.contentWindow?.csrfToken,
              // @ts-ignore
              healthForms: iframe.contentWindow?.phpOptions?.map((item) => ({
                ...item,
                // 和其他地方保持一致，转字符串
                id: item.id.toString(),
              })),
            });

            iframe.remove();

            resolve();
          };
          iframe.onerror = () => {
            resolve();
          };
        });
      },
    }),
    {
      name: 'global',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ menuCollapse: state.menuCollapse }),
    },
  ),
);

export { useGlobalStore };
