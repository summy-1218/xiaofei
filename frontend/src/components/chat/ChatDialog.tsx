"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { type ChatMessage as ChatMessageType } from "@/lib/api";

interface ChatDialogProps {
  messages: ChatMessageType[];
  onSend: (message: string) => Promise<void>;
  loading?: boolean;
}

export function ChatDialog({ messages, onSend, loading }: ChatDialogProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput("");
    await onSend(trimmed);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pb-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-heading-3 text-ink mb-2">你好，我是小飞</h2>
            <p className="text-body-md text-steel max-w-md">
              我是你的飞行理论AI导师。有任何关于飞行原理、航空气象、空中导航等问题，随时问我！
            </p>
          </div>
        ) : (
          messages.map((msg, i) => <ChatMessage key={i} message={msg} />)
        )}
        {loading && (
          <div className="flex items-center gap-2 text-steel px-2">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">小飞思考中...</span>
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="border-t border-hairline pt-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题... (Enter发送，Shift+Enter换行)"
            rows={1}
            className="flex-1 resize-none input-base min-h-[44px] max-h-[120px] py-2.5"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="btn-primary h-[44px] px-4 flex items-center gap-2 shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
