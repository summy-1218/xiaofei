"use client";

import { useMaterialsStore } from "@/stores/materials";
import { FileText, Video, BookOpen } from "lucide-react";

type TabId = "ppt" | "video" | "reading";

const TABS: { id: TabId; icon: typeof FileText; label: string; soon?: boolean }[] = [
  { id: "ppt", icon: FileText, label: "PPT 课件" },
  { id: "video", icon: Video, label: "视频素材", soon: true },
  { id: "reading", icon: BookOpen, label: "补充读物", soon: true },
];

export function TypeTabs() {
  const activeType = useMaterialsStore((s) => s.activeType);
  const setType = useMaterialsStore((s) => s.setType);
  const counts = useMaterialsStore((s) => s.counts);

  return (
    <nav className="type-tabs" role="tablist">
      {TABS.map((t) => {
        const active = activeType === t.id;
        const count =
          t.id === "ppt"
            ? counts?.pptCount ?? 0
            : t.id === "video"
              ? counts?.videoCount ?? 0
              : counts?.readingCount ?? 0;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            className={`type-tab ${active ? "type-tab-active" : ""}`}
            onClick={() => setType(t.id)}
          >
            <t.icon size={16} />
            <span>{t.label}</span>
            <span className="type-tab-badge">{count}</span>
            {t.soon && count === 0 && <span className="type-tab-soon">预留</span>}
          </button>
        );
      })}
    </nav>
  );
}
