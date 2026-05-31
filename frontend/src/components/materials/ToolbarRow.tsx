"use client";

import { useEffect, useState } from "react";
import { Search, LayoutGrid, List } from "lucide-react";
import { useMaterialsStore } from "@/stores/materials";

export function ToolbarRow() {
  const tag = useMaterialsStore((s) => s.tag);
  const setTag = useMaterialsStore((s) => s.setTag);
  const query = useMaterialsStore((s) => s.query);
  const setQuery = useMaterialsStore((s) => s.setQuery);
  const view = useMaterialsStore((s) => s.view);
  const setView = useMaterialsStore((s) => s.setView);
  const sort = useMaterialsStore((s) => s.sort);
  const setSort = useMaterialsStore((s) => s.setSort);

  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/materials/tags")
      .then((r) => r.json())
      .then(setTags)
      .catch(() => {});
  }, []);

  return (
    <div className="toolbar-row">
      {/* 搜索 */}
      <div className="toolbar-search">
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索课件标题、文件名..."
        />
      </div>

      {/* 主题 tag chips */}
      <div className="toolbar-chips">
        <button
          className={`mt-chip ${!tag ? "mt-chip-active" : ""}`}
          onClick={() => setTag(null)}
        >
          全部
        </button>
        {tags.map((t) => (
          <button
            key={t}
            className={`mt-chip ${tag === t ? "mt-chip-active" : ""}`}
            onClick={() => setTag(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 排序 + 视图 */}
      <div className="toolbar-right">
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
        >
          <option value="chapter">按章节</option>
          <option value="newest">最近上传</option>
          <option value="size">文件大小</option>
          <option value="popular">浏览量</option>
        </select>
        <div className="view-toggle">
          <button
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
