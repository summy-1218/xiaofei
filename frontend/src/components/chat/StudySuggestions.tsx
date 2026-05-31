"use client";

import Link from "next/link";
import { Lightbulb, TrendingUp, BookOpen, Target } from "lucide-react";

interface Suggestion {
  icon: "trending" | "book" | "target";
  title: string;
  description: string;
  href: string;
}

interface StudySuggestionsProps {
  weakPoints: string[];
  suggestions: Suggestion[];
}

const iconMap = {
  trending: TrendingUp,
  book: BookOpen,
  target: Target,
};

export function StudySuggestions({ weakPoints, suggestions }: StudySuggestionsProps) {
  return (
    <div className="card-base">
      <h3 className="flex items-center gap-2 text-heading-5 text-ink mb-4">
        <Lightbulb size={18} className="text-warning" />
        学习建议
      </h3>

      {/* 薄弱点 */}
      {weakPoints.length > 0 && (
        <div className="mb-4">
          <div className="text-body-sm text-steel mb-2">📊 需要加强的知识点：</div>
          <div className="flex flex-wrap gap-1.5">
            {weakPoints.map((point) => (
              <span key={point} className="badge-tag-orange">
                {point}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 建议卡片 */}
      <div className="space-y-2">
        {suggestions.map((s, i) => {
          const Icon = iconMap[s.icon];
          return (
            <Link
              key={i}
              href={s.href}
              className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-surface group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-card-sky text-primary">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-body-sm font-medium text-ink">{s.title}</div>
                <div className="text-micro text-steel">{s.description}</div>
              </div>
            </Link>
          );
        })}
        {suggestions.length === 0 && (
          <p className="text-body-sm text-muted text-center py-3">完成更多练习后，这里将展示个性化建议</p>
        )}
      </div>
    </div>
  );
}
