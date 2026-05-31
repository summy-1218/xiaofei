"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, Bookmark, Timer } from "lucide-react";

interface QuickData {
  resume: { sessionId: string; chapterTitle: string; cursor: number; total: number; accuracy: number } | null;
  wrongCount: number;
  favCount: number;
  mockReady: boolean;
}

export function QuickEntries({ courseCode }: { courseCode: string }) {
  const [data, setData] = useState<QuickData | null>(null);

  useEffect(() => {
    fetch(`/api/quiz/quick?course_code=${courseCode}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [courseCode]);

  if (!data) return null;

  const { resume, wrongCount, favCount, mockReady } = data;

  return (
    <section
      className="quick-entries"
      style={{
        gridTemplateColumns: resume ? "2fr 1fr 1fr 1fr" : "1fr 1fr 1fr",
      }}
    >
      {resume && (
        <Link href={`/quiz/session/${resume.sessionId}`} className="qe-card qe-primary">
          <div className="qe-label">继续上次练习</div>
          <div className="qe-title">{resume.chapterTitle}</div>
          <div className="qe-meta">
            第 {resume.cursor} / {resume.total} 题 · 正确率 {resume.accuracy}%
          </div>
          <div className="qe-cta">
            继续 <ArrowRight size={16} />
          </div>
        </Link>
      )}

      <Link href="/quiz/wrong-book" className="qe-card">
        <div className="qe-icon"><AlertCircle size={18} /></div>
        <div className="qe-title-sm">错题本</div>
        <div className="qe-meta">{wrongCount} 道未掌握</div>
      </Link>

      <Link href="/quiz/favorites" className="qe-card">
        <div className="qe-icon"><Bookmark size={18} /></div>
        <div className="qe-title-sm">收藏夹</div>
        <div className="qe-meta">{favCount} 道</div>
      </Link>

      <Link
        href="/quiz/mock"
        className={`qe-card ${!mockReady ? "qe-disabled" : ""}`}
        onClick={(e) => { if (!mockReady) e.preventDefault(); }}
      >
        <div className="qe-icon"><Timer size={18} /></div>
        <div className="qe-title-sm">模拟考</div>
        <div className="qe-meta">100 道 · 限时</div>
      </Link>
    </section>
  );
}
