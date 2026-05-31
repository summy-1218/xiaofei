"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Check, Square, CheckSquare } from "lucide-react";
import { useQbankStore } from "@/stores/qbank";
import { quiz, type Chapter } from "@/lib/api";

export function ChapterPicker({ courseCode }: { courseCode: string }) {
  const [q, setQ] = useState("");
  const [chapters, setChapters] = useState<(Chapter & { progress: number })[]>([]);
  const selectedChapters = useQbankStore((s) => s.selectedChapters);
  const toggleChapter = useQbankStore((s) => s.toggleChapter);
  const selectAllChapters = useQbankStore((s) => s.selectAllChapters);

  useEffect(() => {
    quiz.getChapters(courseCode).then((list) => {
      setChapters(list.map((ch) => ({ ...ch, progress: (ch as any).progress ?? 0 })));
    });
  }, [courseCode]);

  const filtered = useMemo(
    () => chapters.filter((c) => !q || c.name.includes(q) || c.id.includes(q)),
    [q, chapters]
  );

  const allSelected = chapters.length > 0 && selectedChapters.length === chapters.length;
  const noneSelected = selectedChapters.length === 0;

  return (
    <div className="chapter-picker">
      <div className="cp-search">
        <Search size={16} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索章节..."
        />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-steel">
            {selectedChapters.length}/{chapters.length} 章
          </span>
          <button
            type="button"
            onClick={() =>
              selectAllChapters(allSelected ? [] : chapters.map((c) => c.id))
            }
            className="text-xs text-link-blue hover:text-link-blue-pressed"
          >
            {allSelected ? "取消全选" : "全选"}
          </button>
        </div>
      </div>
      <ul className="cp-list" role="listbox">
        {filtered.map((c) => {
          const active = selectedChapters.includes(c.id);
          const pct = Math.round(c.progress * 100);
          return (
            <li
              key={c.id}
              role="option"
              aria-selected={active}
              className={`cp-row ${active ? "cp-row-active" : ""}`}
              onClick={() => toggleChapter(c.id)}
            >
              <span className="cp-check">
                {active ? (
                  <CheckSquare size={16} className="text-primary" />
                ) : (
                  <Square size={16} className="text-muted" />
                )}
              </span>
              <span className="cp-code">{c.id}</span>
              <span className="cp-title">{c.name}</span>
              <span className="cp-count">{c.question_count} 题</span>
              <span className="cp-progress">
                <span className="cp-bar">
                  <span style={{ width: `${pct}%` }} />
                </span>
                <span className="cp-pct">
                  {pct === 0 ? "未开始" : `已做 ${pct}%`}
                </span>
              </span>
              {pct >= 90 && <Check size={14} className="cp-done" />}
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="cp-row" style={{ cursor: "default", color: "#6B6F76" }}>
            无匹配章节
          </li>
        )}
      </ul>
    </div>
  );
}
