"use client";

import { BookOpen, Shuffle, Target, Check } from "lucide-react";
import { useQbankStore } from "@/stores/qbank";

type Mode = "chapter" | "random" | "level";

const MODES: { id: Mode; icon: typeof BookOpen; title: string; desc: string; est: string }[] = [
  { id: "chapter", icon: BookOpen, title: "章节练习", desc: "按章节顺序刷题，含解析", est: "约 60 min" },
  { id: "random", icon: Shuffle, title: "随机组卷", desc: "全章节随机抽 30 题", est: "约 30 min" },
  { id: "level", icon: Target, title: "闯关模式", desc: "五级难度递进，错三淘汰", est: "约 45 min" },
];

export function ModeCards() {
  const mode = useQbankStore((s) => s.mode);
  const setMode = useQbankStore((s) => s.setMode);

  return (
    <div className="mode-grid">
      {MODES.map(({ id, icon: Icon, title, desc, est }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            className={`mode-card ${active ? "mode-card-active" : ""}`}
            onClick={() => setMode(id)}
            aria-pressed={active}
          >
            <div className="mode-head">
              <Icon size={20} className="mode-icon" />
              <span className="mode-title">{title}</span>
              {active && (
                <span className="mode-check">
                  <Check size={14} />
                </span>
              )}
            </div>
            <div className="mode-desc">{desc}</div>
            <div className="mode-est">{est}</div>
          </button>
        );
      })}
    </div>
  );
}
