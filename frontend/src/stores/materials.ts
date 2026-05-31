"use client";

import { create } from "zustand";

type TypeId = "ppt" | "video" | "reading";
type ViewMode = "grid" | "list";
type SortKey = "chapter" | "newest" | "size" | "popular";

interface MaterialsState {
  activeType: TypeId;
  tag: string | null;
  query: string;
  sort: SortKey;
  view: ViewMode;
  counts: { pptCount: number; videoCount: number; readingCount: number } | null;
  setType: (t: TypeId) => void;
  setTag: (t: string | null) => void;
  setQuery: (q: string) => void;
  setSort: (s: SortKey) => void;
  setView: (v: ViewMode) => void;
  setCounts: (c: MaterialsState["counts"]) => void;
}

export const useMaterialsStore = create<MaterialsState>((set) => ({
  activeType: "ppt",
  tag: null,
  query: "",
  sort: "chapter",
  view: "grid",
  counts: null,
  setType: (activeType) => set({ activeType }),
  setTag: (tag) => set({ tag }),
  setQuery: (query) => set({ query }),
  setSort: (sort) => set({ sort }),
  setView: (view) => set({ view }),
  setCounts: (counts) => set({ counts }),
}));
