"use client";

import { useRouter } from "next/navigation";
import { useQuizSessionStore } from "@/stores/quizSession";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
}

export default function QuizSessionPage() {
  const router = useRouter();
  const {
    questions, currentIndex, answers, submitted, score, mode,
    selectAnswer, submitAnswer, nextQuestion, prevQuestion, reset,
  } = useQuizSessionStore();

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <p className="text-steel">没有加载题目</p>
        <button onClick={() => router.push("/quiz")} className="btn-secondary">
          返回题库
        </button>
      </div>
    );
  }

  const q = questions[currentIndex] as any; // extended with correct field
  const total = questions.length;
  const progress = ((currentIndex + 1) / total) * 100;
  const isSubmitted = submitted[currentIndex] || false;
  const userAns = answers[currentIndex] || "";
  const correctAns = q.correct || "";
  const isCorrect = userAns === correctAns;

  // 闯关模式：答错即结束
  const isChallengeOver = mode === "level" && isSubmitted && !isCorrect;

  return (
    <div className="flex flex-col flex-1 main-flex">
      {/* ── 顶栏 ─────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#EDEDEC] px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { reset(); router.push("/quiz"); }}
            className="rounded-md p-1.5 text-steel hover:bg-surface transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm font-medium text-ink">
            第 {currentIndex + 1} / {total} 题
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-steel">得分: {score}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            mode === "level" ? "bg-orange-50 text-orange-700" : "bg-primary/10 text-primary"
          }`}>
            {mode === "level" ? "闯关" : mode === "chapter" ? "章节" : "随机"}
          </span>
        </div>
      </header>

      {/* ── 进度条 ────────────────────────── */}
      <div className="h-1 bg-hairline shrink-0">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── 题目区（可滚动）───────────────── */}
      <div className="flex-1 overflow-y-auto main-flex">
        <div className="mx-auto max-w-[720px] px-4 py-8">
          {/* 题目 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-tag-purple">{q.chapter_id || "飞行原理"}</span>
              {q.difficulty && (
                <span className="text-xs text-muted">难度 {q.difficulty}/5</span>
              )}
            </div>
            {/* 配图 */}
            {q.img && (
              <div className="mb-4 rounded-lg border border-hairline overflow-hidden bg-white">
                <img
                  src={`http://localhost:8000${q.img}`}
                  alt="题目配图"
                  className="w-full max-h-[400px] object-contain"
                />
              </div>
            )}
            <h2 className="text-heading-4 text-ink leading-relaxed">
              {stripHtml(q.title || "")}
            </h2>
          </div>

          {/* 选项 */}
          <div className="space-y-3">
            {Object.entries(q.options || {}).map(([letter, text]) => {
              const isSelected = userAns === letter;
              const isOptionCorrect = letter === correctAns;
              let style = "option-btn";
              if (isSubmitted && isOptionCorrect) style += " option-correct";
              else if (isSubmitted && isSelected && !isOptionCorrect) style += " option-wrong";
              else if (isSelected && !isSubmitted) style += " option-selected";

              return (
                <button
                  key={letter}
                  onClick={() => selectAnswer(currentIndex, letter)}
                  className={style}
                  disabled={isSubmitted}
                >
                  <span className="option-letter">{letter}</span>
                  <span className="flex-1 text-left">{stripHtml(String(text))}</span>
                  {isSubmitted && isOptionCorrect && <CheckCircle2 size={18} className="text-green-600 shrink-0" />}
                  {isSubmitted && isSelected && !isOptionCorrect && <XCircle size={18} className="text-red-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* 解析 */}
          {isSubmitted && (
            <div className="mt-6 p-4 rounded-lg bg-surface border border-hairline">
              <div className="text-sm font-semibold text-ink mb-2">
                {isCorrect ? "✅ 回答正确" : `❌ 正确答案是 ${correctAns}`}
              </div>
              {/* 答案配图 */}
              {q.ans_img && (
                <div className="mb-3 rounded-lg border border-hairline overflow-hidden bg-white">
                  <img
                    src={`http://localhost:8000${q.ans_img}`}
                    alt="答案解析配图"
                    className="w-full max-h-[300px] object-contain"
                  />
                </div>
              )}
              {q.explanation && (
                <div className="text-sm text-steel leading-relaxed">
                  {stripHtml(q.explanation)}
                </div>
              )}
            </div>
          )}

          {/* 闯关失败 */}
          {isChallengeOver && (
            <div className="mt-6 p-6 rounded-lg bg-red-50 border border-red-200 text-center">
              <div className="text-2xl mb-2">💥</div>
              <div className="text-lg font-semibold text-red-700 mb-1">闯关失败</div>
              <div className="text-sm text-red-600 mb-4">答错了，本次闯关结束。最终得分：{score} / {currentIndex + 1}</div>
              <button
                onClick={() => { reset(); router.push("/quiz"); }}
                className="btn-primary"
              >
                返回题库
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 底部操作栏 ────────────────────── */}
      {!isChallengeOver && (
        <footer className="shrink-0 border-t border-[#EDEDEC] bg-white px-4 py-3">
          <div className="mx-auto max-w-[720px] flex items-center justify-between gap-3">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="btn-secondary inline-flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft size={16} /> 上一题
            </button>

            <div className="flex items-center gap-2">
              {!isSubmitted ? (
                <button
                  onClick={() => submitAnswer(currentIndex)}
                  disabled={!userAns}
                  className="btn-primary disabled:opacity-40"
                >
                  提交答案
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  disabled={currentIndex >= total - 1}
                  className="btn-primary inline-flex items-center gap-1 disabled:opacity-40"
                >
                  下一题 <ChevronRight size={16} />
                </button>
              )}
            </div>

            <button
              onClick={nextQuestion}
              disabled={currentIndex >= total - 1}
              className="btn-secondary inline-flex items-center gap-1 disabled:opacity-40"
            >
              下一题 <ChevronRight size={16} />
            </button>
          </div>

          {/* 完成后 */}
          {isSubmitted && currentIndex >= total - 1 && (
            <div className="mx-auto max-w-[720px] mt-3 pt-3 border-t border-hairline flex items-center justify-between">
              <span className="text-sm text-steel">
                完成！正确 {score} / {total}（{Math.round((score / total) * 100)}%）
              </span>
              <button
                onClick={() => { reset(); router.push("/quiz"); }}
                className="btn-secondary inline-flex items-center gap-1"
              >
                <RotateCcw size={16} /> 返回题库
              </button>
            </div>
          )}
        </footer>
      )}
    </div>
  );
}
