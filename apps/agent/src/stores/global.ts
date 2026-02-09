import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface GlobalState {
  init: boolean;
  doInit: (silent?: boolean) => Promise<void>;
  menuCollapse: boolean;
  setMenuCollapse: (collapse?: boolean) => void;
  dashboard?: {
    csrfToken?: string;
  };
  /** 从 dashboard HTML 中解析值 */
  fetchDashboard: () => Promise<void>;
}

const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      init: false,
      doInit: async () => {
        await get().fetchDashboard();
        console.log('dashboard', get().dashboard);
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
        // 匹配 window.csrfToken = "xxx" 或 window.csrfToken = 'xxx'
        const match = html.match(/window\.csrfToken\s*=\s*["']([^"']+)["']/);
        set({ dashboard: { csrfToken: match ? match[1] : undefined } });
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
