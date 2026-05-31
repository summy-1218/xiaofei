"use client";

import { Brain } from "lucide-react";
import { useThreadStore } from "@/lib/store";

export function ThinkToggle() {
  const thinkMode = useThreadStore((s) => s.thinkMode);
  const setThinkMode = useThreadStore((s) => s.setThinkMode);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={thinkMode}
      onClick={() => setThinkMode(!thinkMode)}
      className={`flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs transition
        ${
          thinkMode
            ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
            : "text-neutral-500 hover:bg-neutral-100"
        }`}
      title="切到 V4-Pro，约慢 3-5 秒，适合推导/计算"
    >
      <Brain size={14} />
      <span>深度思考</span>
    </button>
  );
}
