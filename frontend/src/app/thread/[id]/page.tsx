"use client";

import { useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2, MoreHorizontal } from "lucide-react";
import { useThreadStore } from "@/lib/store";
import { MessageList } from "@/components/chat/MessageList";
import { Composer } from "@/components/chat/Composer";
import { chat, type ChatMessage } from "@/lib/api";

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = (params?.id ?? "") as string;

  const {
    threads,
    addMessage,
    setTitle,
    streamingContent,
    isStreaming,
    setStreaming,
    finishStreaming,
  } = useThreadStore();

  const thread = threads[threadId];

  // 防重入
  const runningRef = useRef(false);
  const processedRef = useRef(0);

  useEffect(() => {
    if (!thread || runningRef.current) return;
    const n = thread.messages.length;
    if (n === 0 || n <= processedRef.current) return;
    if (thread.messages[n - 1].role !== "user") return;

    processedRef.current = n;
    runningRef.current = true;
    doChat();
  }, [thread?.messages.length]);

  const doChat = async () => {
    const msgs = thread!.messages;
    const forcePro = useThreadStore.getState().thinkMode;
    const userMsg = msgs[msgs.length - 1].content;

    setStreaming("");
    let full = "";

    try {
      const result = await chat.send(threadId, userMsg, forcePro);
      full = result.reply.content || "";

      // 流式渲染
      for (let i = 1; i <= full.length; i += 3) {
        setStreaming(full.slice(0, i));
        await new Promise((r) => setTimeout(r, 10));
      }
      setStreaming(full);
      finishStreaming(threadId);

      if (full.length > 10) {
        const t = msgs[msgs.length - 1].content.replace(/^[#*\s]+/, "").trim();
        setTitle(threadId, t.length > 12 ? t.slice(0, 12) + "…" : t || "新对话");
      }
    } catch {
      finishStreaming(threadId);
    }
    runningRef.current = false;
  };

  const handleSubmit = useCallback(
    (prompt: string) => {
      addMessage(threadId, {
        id: `user-${Date.now()}`,
        role: "user",
        content: prompt,
        created_at: new Date().toISOString(),
      });
    },
    [threadId, addMessage]
  );

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <p className="text-steel">对话未找到</p>
        <button onClick={() => router.push("/")} className="btn-secondary">
          回到首页
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 main-flex">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#EDEDEC] px-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/")}
            className="rounded-md p-1.5 text-steel hover:bg-surface transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm font-medium text-ink truncate">{thread.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button className="rounded-md p-1.5 text-steel hover:bg-surface transition-colors">
            <Share2 size={16} />
          </button>
          <button className="rounded-md p-1.5 text-steel hover:bg-surface transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </header>

      <MessageList
        messages={thread.messages}
        streamingContent={isStreaming ? streamingContent : undefined}
        isStreaming={isStreaming}
      />

      <Composer mode="thread" onSubmit={handleSubmit} loading={isStreaming} />
    </div>
  );
}
