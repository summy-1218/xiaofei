"use client";

import { useEffect, useState } from "react";
import { MessageSquare, CheckCircle2, Sparkles, Inbox } from "lucide-react";

interface PulseData { totalPosts: number; solvedRate: number; todayNew: number; myPending: number; }

export function PulseStrip({ courseCode }: { courseCode: string }) {
  const [data, setData] = useState<PulseData | null>(null);
  useEffect(() => {
    fetch(`http://localhost:8000/api/forum/pulse?course_code=${courseCode}`)
      .then((r) => r.json()).then(setData).catch(() => {});
  }, [courseCode]);

  const items = [
    { icon: MessageSquare, label: "总问答", value: data?.totalPosts ?? "—" },
    { icon: CheckCircle2, label: "已解决率", value: data ? `${data.solvedRate}%` : "—", tint: "solved" as const },
    { icon: Sparkles, label: "今日新帖", value: data?.todayNew ?? "—" },
    { icon: Inbox, label: "我的待回复", value: data?.myPending ?? "—", tint: (data?.myPending ?? 0) > 0 ? "open" as const : undefined },
  ];

  return (
    <div className="overview-strip">
      {items.map((it) => (
        <div key={it.label} className="ov-card">
          <div className={`ov-icon ${it.tint ? `ov-tint-${it.tint}` : ""}`}><it.icon size={18} /></div>
          <div className="ov-text">
            <div className="ov-label">{it.label}</div>
            <div className="ov-value">{it.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
