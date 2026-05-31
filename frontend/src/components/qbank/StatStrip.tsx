"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

type Stat = {
  key: string;
  label: string;
  value: string;
  delta?: { value: number; positive: boolean };
};

function skeletonStats(): Stat[] {
  return [
    { key: "total", label: "总题量", value: "—" },
    { key: "attempted", label: "已练习", value: "—" },
    { key: "accuracy", label: "正确率", value: "—" },
    { key: "todayNew", label: "今日新增", value: "—" },
  ];
}

export function StatStrip({ courseCode }: { courseCode: string }) {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    fetch(`/api/quiz/stats?course_code=${courseCode}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(skeletonStats()));
  }, [courseCode]);

  const data = stats.length ? stats : skeletonStats();

  return (
    <div className="stat-strip">
      {data.map((s) => (
        <div key={s.key} className="stat-card">
          <div className="stat-label">{s.label}</div>
          <div className="stat-value-row">
            <span className="stat-value">{s.value}</span>
            {s.delta && (
              <span className={`stat-delta ${s.delta.positive ? "stat-delta-up" : "stat-delta-down"}`}>
                {s.delta.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {s.delta.value}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
