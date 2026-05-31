"use client";

import { Clock, Flame, HelpCircle, User } from "lucide-react";
import { useCommunityStore } from "@/stores/community";

const VIEWS = [
  { id: "latest" as const, icon: Clock, label: "最新" },
  { id: "hot" as const, icon: Flame, label: "热门" },
  { id: "unsolved" as const, icon: HelpCircle, label: "未解答" },
  { id: "mine" as const, icon: User, label: "我的" },
];

export function ViewTabs() {
  const view = useCommunityStore((s) => s.view);
  const setView = useCommunityStore((s) => s.setView);

  return (
    <nav className="type-tabs" role="tablist">
      {VIEWS.map((v) => {
        const active = view === v.id;
        return (
          <button
            key={v.id}
            role="tab"
            aria-selected={active}
            className={`type-tab ${active ? "type-tab-active" : ""}`}
            onClick={() => setView(v.id)}
          >
            <v.icon size={16} />
            <span>{v.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
