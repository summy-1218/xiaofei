"use client";

import { useEffect, useState } from "react";
import { FileText, Video, HardDrive, Sparkles } from "lucide-react";

interface OverviewData {
  pptCount: number;
  videoCount: number;
  readingCount: number;
  totalSize: string;
  weekNew: number;
}

export function ResourceOverview({ courseCode }: { courseCode: string }) {
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    fetch(`/api/materials/overview?course_code=${courseCode}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [courseCode]);

  const items = [
    { icon: FileText, label: "PPT 课件", value: data?.pptCount ?? "—", tint: "ppt" as const },
    { icon: Video, label: "视频素材", value: data?.videoCount ?? "—", tint: "video" as const, muted: !data?.videoCount },
    { icon: HardDrive, label: "总大小", value: data?.totalSize ?? "—" },
    { icon: Sparkles, label: "本周新增", value: data?.weekNew ?? "—" },
  ];

  return (
    <div className="overview-strip">
      {items.map((it) => (
        <div key={it.label} className={`ov-card ${it.muted ? "ov-muted" : ""}`}>
          <div className={`ov-icon ${it.tint ? `ov-tint-${it.tint}` : ""}`}>
            <it.icon size={18} />
          </div>
          <div className="ov-text">
            <div className="ov-label">{it.label}</div>
            <div className="ov-value">{it.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
