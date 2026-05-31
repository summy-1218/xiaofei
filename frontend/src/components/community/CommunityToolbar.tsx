"use client";

import { Search } from "lucide-react";
import { useCommunityStore } from "@/stores/community";

export function CommunityToolbar({ courseCode }: { courseCode: string }) {
  const query = useCommunityStore((s) => s.query);
  const setQuery = useCommunityStore((s) => s.setQuery);
  const statusFilters = useCommunityStore((s) => s.statusFilters);
  const toggleStatus = useCommunityStore((s) => s.toggleStatus);
  const sort = useCommunityStore((s) => s.sort);
  const setSort = useCommunityStore((s) => s.setSort);

  return (
    <div className="toolbar-row community-toolbar" style={{ gridTemplateColumns: "320px 1fr auto" }}>
      <div className="toolbar-search">
        <Search size={16} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索问题、关键词..." />
      </div>

      <div className="toolbar-chips">
        {(["未解答", "已解决", "有 AI 答案"] as const).map((s) => (
          <button
            key={s}
            className={`mt-chip ${statusFilters.includes(s) ? "mt-chip-active" : ""}`}
            onClick={() => toggleStatus(s)}
            style={{ fontSize: 12 }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="toolbar-right">
        <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="latest">最新</option>
          <option value="replies">回复多</option>
          <option value="views">浏览多</option>
          <option value="votes">点赞多</option>
        </select>
      </div>
    </div>
  );
}
