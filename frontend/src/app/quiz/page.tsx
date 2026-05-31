"use client";

import { StatStrip } from "@/components/qbank/StatStrip";
import { QuickEntries } from "@/components/qbank/QuickEntries";
import { ModeCards } from "@/components/qbank/ModeCards";
import { ChapterPicker } from "@/components/qbank/ChapterPicker";
import { FilterChips } from "@/components/qbank/FilterChips";
import { StartCTA } from "@/components/qbank/StartCTA";
import { useQbankStore } from "@/stores/qbank";

function ModeCountSelector() {
  const mode = useQbankStore((s) => s.mode);
  const count = useQbankStore((s) => s.count);
  const setCount = useQbankStore((s) => s.setCount);
  if (mode !== "random") return null;
  return (
    <div className="flex items-center gap-3 mt-4">
      <span className="text-sm text-steel">题目数量</span>
      {[10, 20, 30, 50].map((n) => (
        <button
          key={n}
          type="button"
          className={`chip ${count === n ? "chip-active" : ""}`}
          onClick={() => setCount(n)}
        >
          {n} 题
        </button>
      ))}
    </div>
  );
}

export default function QuizPage() {
  return (
    <div className="main-flex flex flex-1 flex-col">
      <header className="main-header">
        <h1 className="text-[22px] font-semibold text-ink">题库练习</h1>
        <p className="text-sm text-steel mt-1">
          已接入飞行原理本地题库（1631 题），可按章节练习、随机组卷和闯关训练。
        </p>
      </header>

      {/* 唯一滚动容器 */}
      <div className="main-scroll flex-1 overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 32px 80px" }}>
          {/* Block 1: KPI 学情条 */}
          <StatStrip courseCode="081" />

          {/* Block 2: 快捷入口 */}
          <QuickEntries courseCode="081" />

          {/* Block 3: 模式选择卡片 */}
          <section style={{ marginBottom: 32 }}>
            <h2 className="text-sm font-semibold text-charcoal mb-3">选择练习方式</h2>
            <ModeCards />
            {/* 随机组卷时显示数量选择 */}
            <ModeCountSelector />
          </section>

          {/* Block 4: 章节选择 */}
          <section style={{ marginBottom: 24 }}>
            <h2 className="text-sm font-semibold text-charcoal mb-3">选择章节</h2>
            <ChapterPicker courseCode="081" />
            {/* Block 5: 筛选 chips */}
            <FilterChips />
          </section>

          {/* Block 6: CTA 按钮 */}
          <StartCTA />
        </div>
      </div>
    </div>
  );
}
