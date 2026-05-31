"use client";

import { useQbankStore } from "@/stores/qbank";

type FilterKey = "order";

const GROUPS: { key: FilterKey; label: string; options: string[]; multi: boolean }[] = [
  { key: "order", label: "顺序", options: ["顺序", "乱序"], multi: false },
];

export function FilterChips() {
  const filters = useQbankStore((s) => s.filters);
  const toggleFilter = useQbankStore((s) => s.toggleFilter);

  return (
    <div className="filter-chips">
      {GROUPS.map((g) => (
        <div key={g.key} className="chip-group">
          <div className="chip-group-label">{g.label}</div>
          <div className="chip-row">
            {g.options.map((opt) => {
              const active = (filters[g.key] ?? []).includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  className={`chip ${active ? "chip-active" : ""}`}
                  onClick={() => toggleFilter(g.key, opt, g.multi)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
