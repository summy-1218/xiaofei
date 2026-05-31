"use client";

import { User, Plane } from "lucide-react";
import { Markdown } from "./Markdown";
import { MessageActions } from "./MessageActions";
import type { ChatMessage as ChatMessageType } from "@/lib/api";

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: () => void;
  onQuote?: () => void;
}

export function ChatMessage({ message, onRetry, onQuote }: ChatMessageProps) {
  const isUser = message.role === "user";

  // ── 用户消息：浅灰圆角块，右对齐 ──────────
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="chat-message-user">
          <p className="text-base whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // ── 助手消息：文档流平铺，无气泡 ──────────
  return (
    <div className="assistant-message chat-message-assistant">
      {/* 小 ✈️ 图标 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Plane size={12} />
        </div>
        <span className="text-xs font-medium text-muted">小飞</span>
      </div>

      {/* 内容 — 单条 Markdown 管线 + sanitizeMath */}
      <div className="text-base leading-relaxed">
        <Markdown>{message.content}</Markdown>
      </div>

      {/* 引用来源 */}
      {message.citations && message.citations.length > 0 && (
        <div className="mt-3 border-t border-hairline pt-2">
          <span className="text-xs text-steel">📚 参考：</span>
          {message.citations.map((c, i) => (
            <span key={i} className="ml-2 text-xs text-link-blue">
              {c.source}{c.page ? ` p.${c.page}` : ""}
            </span>
          ))}
        </div>
      )}

      {/* Hover Action Bar */}
      <MessageActions
        content={message.content}
        onRetry={onRetry}
        onQuote={onQuote}
      />
    </div>
  );
}
