import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface GlobalState {
  init: boolean;
  doInit: (silent?: boolean) => Promise<void>;
  menuCollapse: boolean;
  setMenuCollapse: (collapse?: boolean) => void;
}

const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      init: false,

      doInit: async () => {
        set({ init: true });
      },

      menuCollapse: false,
      setMenuCollapse: (collapse?: boolean) =>
        set((state) => {
          // 如果提供则使用，不提供则 toggle
          return { menuCollapse: collapse ?? !state.menuCollapse };
        }),
    }),
    {
      name: 'global',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ menuCollapse: state.menuCollapse }),
    },
  ),
);

export { useGlobalStore };
