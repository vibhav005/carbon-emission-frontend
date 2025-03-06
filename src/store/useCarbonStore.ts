// store/useCarbonStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CarbonStore } from "../types/carbon";

const useCarbonStore = create<CarbonStore>(
  persist(
    (set) => ({
      history: [],
      addEntry: (entry) =>
        set((state) => ({
          history: [
            ...state.history,
            {
              ...entry,
              date: entry.date || new Date().toISOString(),
            },
          ],
        })),
      removeEntry: (index) =>
        set((state) => ({
          history: state.history.filter((_, i) => i !== index),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "carbon-storage",
    }
  )
);

export default useCarbonStore;
