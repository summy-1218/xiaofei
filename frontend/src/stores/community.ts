"use client";

import { create } from "zustand";

type View = "latest" | "hot" | "unsolved" | "mine";
type Sort = "latest" | "replies" | "views" | "votes";
type Status = "未解答" | "已解决" | "有 AI 答案";

interface CommunityState {
  view: View;
  chapter: string | null;
  statusFilters: Status[];
  sort: Sort;
  query: string;
  setView: (v: View) => void;
  setChapter: (c: string | null) => void;
  toggleStatus: (s: Status) => void;
  setSort: (s: Sort) => void;
  setQuery: (q: string) => void;
}

export const useCommunityStore = create<CommunityState>((set) => ({
  view: "latest",
  chapter: null,
  statusFilters: [],
  sort: "latest",
  query: "",
  setView: (view) => set({ view }),
  setChapter: (chapter) => set({ chapter }),
  toggleStatus: (s) =>
    set((state) => ({
      statusFilters: state.statusFilters.includes(s)
        ? state.statusFilters.filter((x) => x !== s)
        : [...state.statusFilters, s],
    })),
  setSort: (sort) => set({ sort }),
  setQuery: (query) => set({ query }),
}));
