"use client";

import { useState, useCallback } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQbankStore } from "@/stores/qbank";
import { useQuizSessionStore } from "@/stores/quizSession";
import { quiz } from "@/lib/api";

const MODE_LABEL: Record<string, string> = {
  chapter: "章节练习",
  random: "随机组卷",
  level: "闯关模式",
};

export function StartCTA() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { mode, selectedChapters, count } = useQbankStore();

  const chapterLabel =
    selectedChapters.length === 0
      ? null
      : selectedChapters.length === 1
        ? selectedChapters[0]
        : `${selectedChapters.length} 个章节`;

  // 随机组卷：用设置的数量；章节/闯关：全部题目
  const actualCount = mode === "random" ? count : 9999;
  const countLabel = mode === "random" ? `${count} 题` : "全部题目";

  const summary = [
    MODE_LABEL[mode] ?? "请选择模式",
    chapterLabel,
    countLabel,
  ].filter(Boolean).join(" · ");

  const disabled =
    !mode ||
    (mode === "chapter" && selectedChapters.length === 0) ||
    loading;

  const start = useCallback(async () => {
    if (disabled) return;
    setLoading(true);
    try {
      const result = await quiz.startPractice({
        mode: mode === "level" ? "challenge" : (mode as "chapter" | "random"),
        chapter_ids:
          selectedChapters.length > 0 ? selectedChapters : undefined,
        count: actualCount,
      });
      if (result.questions.length === 0) {
        setLoading(false);
        return;
      }
      useQuizSessionStore.getState().loadQuestions(result.questions, mode);
      router.push("/quiz/session");
    } catch {
      setLoading(false);
    }
  }, [disabled, mode, selectedChapters, count, actualCount, router]);

  return (
    <button className="start-cta" disabled={disabled} onClick={start}>
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          加载题目中...
        </>
      ) : (
        <>
          <span>开始练习 · {summary}</span>
          <ArrowRight size={18} />
        </>
      )}
    </button>
  );
}
