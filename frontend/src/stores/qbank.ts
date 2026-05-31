"use client";

import { create } from "zustand";

type Mode = "chapter" | "random" | "level";
type FilterKey = "difficulty" | "status" | "source" | "order";

interface QbankState {
  mode: Mode;
  selectedChapters: string[];
  count: number;
  filters: Record<FilterKey, string[]>;
  setMode: (m: Mode) => void;
  toggleChapter: (id: string) => void;
  selectAllChapters: (ids: string[]) => void;
  setCount: (n: number) => void;
  toggleFilter: (k: FilterKey, opt: string, multi: boolean) => void;
}

export const useQbankStore = create<QbankState>((set) => ({
  mode: "chapter",
  selectedChapters: [],
  count: 30,
  filters: {
    difficulty: ["全部"],
    status: [],
    source: ["正题"],
    order: ["顺序"],
  },
  setMode: (mode) => set({ mode }),
  toggleChapter: (id) =>
    set((s) => ({
      selectedChapters: s.selectedChapters.includes(id)
        ? s.selectedChapters.filter((c) => c !== id)
        : [...s.selectedChapters, id],
    })),
  selectAllChapters: (ids) => set({ selectedChapters: ids }),
  setCount: (count) => set({ count }),
  toggleFilter: (k, opt, multi) =>
    set((s) => {
      const cur = s.filters[k] ?? [];
      const next = multi
        ? cur.includes(opt)
          ? cur.filter((x) => x !== opt)
          : [...cur, opt]
        : [opt];
      return { filters: { ...s.filters, [k]: next } };
    }),
}));
