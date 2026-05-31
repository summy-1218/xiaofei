"use client";

import { create } from "zustand";
import type { ChatMessage } from "@/lib/api";

// ── 对话线程 ──────────────────────────────────
export interface Thread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

// ── Store ─────────────────────────────────────
interface ThreadStore {
  threads: Record<string, Thread>;
  activeThreadId: string | null;
  streamingContent: string;
  isStreaming: boolean;
  thinkMode: boolean;

  // Actions
  createThread: (id: string) => void;
  setThinkMode: (v: boolean) => void;
  addMessage: (threadId: string, message: ChatMessage) => void;
  setTitle: (threadId: string, title: string) => void;
  setStreaming: (content: string) => void;
  finishStreaming: (threadId: string) => void;
  getThread: (threadId: string) => Thread | undefined;
  listThreads: () => Thread[];
}

export const useThreadStore = create<ThreadStore>((set, get) => ({
  threads: {},
  activeThreadId: null,
  streamingContent: "",
  isStreaming: false,
  thinkMode: false,

  setThinkMode: (v) => set({ thinkMode: v }),
  removeThread: (id: string) =>
    set((s) => {
      const threads = { ...s.threads };
      delete threads[id];
      return { threads };
    }),

  createThread: (id: string) => {
    set((s) => ({
      threads: {
        ...s.threads,
        [id]: { id, title: "新对话", messages: [], createdAt: new Date().toISOString() },
      },
      activeThreadId: id,
    }));
  },

  addMessage: (threadId, message) => {
    set((s) => {
      const thread = s.threads[threadId];
      if (!thread) return s;
      return {
        threads: {
          ...s.threads,
          [threadId]: { ...thread, messages: [...thread.messages, message] },
        },
      };
    });
  },

  setTitle: (threadId, title) => {
    set((s) => {
      const thread = s.threads[threadId];
      if (!thread) return s;
      return {
        threads: {
          ...s.threads,
          [threadId]: { ...thread, title },
        },
      };
    });
  },

  setStreaming: (content) => set({ streamingContent: content, isStreaming: true }),

  finishStreaming: (threadId) => {
    const content = get().streamingContent;
    if (!content) return;
    const msg: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content,
      created_at: new Date().toISOString(),
    };
    set((s) => {
      const thread = s.threads[threadId];
      if (!thread) return { streamingContent: "", isStreaming: false };
      return {
        threads: {
          ...s.threads,
          [threadId]: { ...thread, messages: [...thread.messages, msg] },
        },
        streamingContent: "",
        isStreaming: false,
      };
    });
  },

  getThread: (threadId) => get().threads[threadId],

  listThreads: () =>
    Object.values(get().threads).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
}));

// ── Helpers ───────────────────────────────────
export function generateThreadId(): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < 10; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
