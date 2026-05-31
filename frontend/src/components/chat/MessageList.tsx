"use client";

import { useRef, useLayoutEffect, useState, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import type { ChatMessage as ChatMessageType } from "@/lib/api";

interface MessageListProps {
  messages: ChatMessageType[];
  streamingContent?: string;
  isStreaming?: boolean;
}

export function MessageList({ messages, streamingContent, isStreaming }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [stickToBottom, setStickToBottom] = useState(true);

  // 用 useLayoutEffect 避免闪烁
  useLayoutEffect(() => {
    if (stickToBottom) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages.length, streamingContent?.length, stickToBottom]);

  // 用户上滑超过 40px 则停止跟随
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setStickToBottom(distance < 40);
  }, []);

  const jumpToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setStickToBottom(true);
  };

  return (
    <div className="relative flex-1 main-flex">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="scroll-area thread-scrollbar h-full overflow-y-auto overflow-x-hidden"
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="thread-messages mx-auto max-w-[720px] px-4 py-8 space-y-6">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}

          {/* streaming */}
          {isStreaming && streamingContent && (
            <ChatMessage
              message={{
                id: "streaming",
                role: "assistant",
                content: streamingContent,
                created_at: "",
              }}
            />
          )}

          {/* loading dots */}
          {isStreaming && !streamingContent && (
            <div className="flex items-center gap-2 text-steel pl-1">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ↓ 跳到最新 */}
      {!stickToBottom && (
        <button
          onClick={jumpToBottom}
          className="absolute bottom-4 right-6 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink-deep text-white shadow-lg transition-opacity hover:opacity-80 animate-bounce"
        >
          <ArrowDown size={16} />
        </button>
      )}
    </div>
  );
}
