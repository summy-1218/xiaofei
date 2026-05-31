"use client";

import { useState, useRef, useEffect } from "react";
import { Send, AtSign, Slash, Paperclip } from "lucide-react";
import { ThinkToggle } from "./ThinkToggle";
import { useThreadStore } from "@/lib/store";

const QUICK_PROMPTS = [
  "升力公式详解",
  "伯努利原理在飞行中的应用",
  "失速的识别与改出",
  "襟翼的作用和使用场景",
];

type ComposerMode = "hero" | "thread";

interface ComposerProps {
  onSubmit: (message: string) => void;
  loading?: boolean;
  mode?: ComposerMode;
  placeholder?: string;
}

export function Composer({
  onSubmit,
  loading,
  mode = "thread",
  placeholder,
}: ComposerProps) {
  const [input, setInput] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const isHero = mode === "hero";
  const thinkMode = useThreadStore((s) => s.thinkMode);

  useEffect(() => {
    if (!loading) ref.current?.focus();
  }, [loading]);

  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
    setInput("");
    ref.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const defaultPlaceholder = isHero
    ? "小飞，今天想精进哪个知识点？"
    : "继续提问…（Shift+Enter 换行）";

  // ── 共享的输入框 + 底部工具条 ─────────────
  const composerInner = (
    <div className={`composer ${isHero ? "composer--hero" : "composer--thread"}`}>
      <textarea
        ref={ref}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder || defaultPlaceholder}
        rows={isHero ? 3 : 2}
        className="composer__input"
        autoFocus
      />
      <div className="composer__toolbar">
        {/* 左侧工具按钮 */}
        <button type="button" title="@ 引用页面/知识点" className="composer__icon-btn">
          <AtSign size={16} />
        </button>
        <button type="button" title="/ 命令" className="composer__icon-btn">
          <Slash size={16} />
        </button>
        <button type="button" title="附件" className="composer__icon-btn">
          <Paperclip size={16} />
        </button>

        <div className="flex-1" />

        {/* 深度思考 + Pro 路由指示 */}
        <ThinkToggle />
        {thinkMode && (
          <span className="text-[11px] text-indigo-500 font-medium mr-1">
            V4-Pro
          </span>
        )}

        {/* 发送按钮 */}
        <button
          onClick={submit}
          disabled={!input.trim() || loading}
          className="composer__send"
          title={isHero ? "发送" : "发送 (Enter)"}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );

  // ── Hero 模式：居中，chips 在上方 ────────
  if (isHero) {
    return (
      <div className="w-full max-w-[720px] mx-auto">
        {/* chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => onSubmit(p)}
              disabled={loading}
              className="chip"
            >
              {p}
            </button>
          ))}
        </div>

        {composerInner}

        <p className="mt-3 text-xs text-muted text-center">
          小飞基于 DeepSeek V4 驱动 · Flash 模式
          {thinkMode && " · 🧠 深度思考已开启（Pro）"}
        </p>
      </div>
    );
  }

  // ── Thread 模式：吸底 ───────────────────
  return (
    <footer
      className="thread-composer shrink-0 border-t border-[#EDEDEC] bg-white"
      style={{ boxShadow: "0 -8px 24px -16px rgba(0,0,0,0.08)" }}
    >
      <div className="mx-auto w-full max-w-[720px] px-4 py-3">
        {composerInner}
      </div>
    </footer>
  );
}
