"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, RefreshCw, ThumbsUp, ThumbsDown, Quote } from "lucide-react";
import { copyMessage, type CopyFormat } from "@/lib/clipboard";

interface MessageActionsProps {
  content: string;
  onRetry?: () => void;
  onRate?: (v: 1 | -1) => void;
  onQuote?: () => void;
}

export function MessageActions({ content, onRetry, onRate, onQuote }: MessageActionsProps) {
  const [copied, setCopied] = useState<CopyFormat | null>(null);
  const [open, setOpen] = useState(false);

  async function doCopy(fmt: CopyFormat) {
    try {
      await copyMessage(content, fmt);
      setCopied(fmt);
      setTimeout(() => setCopied(null), 1500);
      setOpen(false);
    } catch {
      // clipboard failed silently
    }
  }

  return (
    <div className="msg-actions" role="toolbar" aria-label="消息操作">
      {/* 默认：复制 Markdown */}
      <button
        title="复制（Markdown）"
        onClick={() => doCopy("md")}
        className="msg-actions-btn"
      >
        {copied === "md" ? <Check size={14} /> : <Copy size={14} />}
      </button>

      {/* 更多格式 */}
      <div className="msg-actions-dropdown">
        <button
          title="更多复制选项"
          onClick={() => setOpen((v) => !v)}
          className="msg-actions-btn"
        >
          <ChevronDown size={14} />
        </button>
        {open && (
          <ul className="msg-actions-menu" onMouseLeave={() => setOpen(false)}>
            <li onClick={() => doCopy("md")}>
              {copied === "md" ? "✅" : "📋"} 复制为 Markdown（含 LaTeX）
            </li>
            <li onClick={() => doCopy("rich")}>
              {copied === "rich" ? "✅" : "🎨"} 复制为富文本（粘到 Notion / Word）
            </li>
            <li onClick={() => doCopy("plain")}>
              {copied === "plain" ? "✅" : "📝"} 复制为纯文本
            </li>
          </ul>
        )}
      </div>

      <span className="msg-actions-divider" />

      {onRetry && (
        <button title="重新生成" onClick={onRetry} className="msg-actions-btn">
          <RefreshCw size={14} />
        </button>
      )}
      {onRate && (
        <>
          <button title="有帮助" onClick={() => onRate(1)} className="msg-actions-btn">
            <ThumbsUp size={14} />
          </button>
          <button title="有问题" onClick={() => onRate(-1)} className="msg-actions-btn">
            <ThumbsDown size={14} />
          </button>
        </>
      )}
      {onQuote && (
        <button title="作为新提问引用" onClick={onQuote} className="msg-actions-btn">
          <Quote size={14} />
        </button>
      )}
    </div>
  );
}
