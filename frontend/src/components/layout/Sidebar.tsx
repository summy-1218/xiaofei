"use client";

import { useRouter, usePathname } from "next/navigation";
import { useThreadStore } from "@/lib/store";
import { Plus, MessageCircle, BookOpen, FileText, Users, MoreHorizontal } from "lucide-react";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const listThreads = useThreadStore((s) => s.listThreads);
  const threads = listThreads();

  // ── 按时间分组 ──────────────────────────────
  const groups = groupThreads(threads);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : (pathname ?? "").startsWith(href);

  return (
    <aside className="flex w-[260px] shrink-0 flex-col bg-gradient-to-b from-[#0a1530] to-[#070f24] text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <span className="text-2xl">✈️</span>
        <div>
          <div className="text-base font-semibold leading-tight">小飞</div>
          <div className="text-[11px] text-white/50 leading-tight">飞行学员智能助手</div>
        </div>
      </div>

      {/* 新建对话 */}
      <div className="px-3 pt-3">
        <button
          onClick={() => router.push("/")}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10"
        >
          <Plus size={16} />
          新建对话
        </button>
      </div>

      {/* 对话历史（可滚动） */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {Object.entries(groups).map(([label, items]) =>
          items.length > 0 ? (
            <div key={label}>
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                {label}
              </div>
              {items.map((t) => (
                <button
                  key={t.id}
                  onClick={() => router.push(`/thread/${t.id}`)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors group ${
                    pathname === `/thread/${t.id}`
                      ? "bg-white/15 text-white"
                      : "text-white/55 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <MessageCircle size={14} className="shrink-0" />
                  <span className="truncate flex-1 text-left">{t.title}</span>
                  <MoreHorizontal
                    size={14}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
            </div>
          ) : null
        )}
        {threads.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-white/30">
            还没有对话记录
          </p>
        )}
      </nav>

      {/* 底部功能入口 */}
      <div className="border-t border-white/10 px-3 py-3 space-y-1">
        {[
          { icon: BookOpen, label: "题库", href: "/quiz" },
          { icon: FileText, label: "资料", href: "/materials" },
          { icon: Users, label: "社区", href: "/forum" },
        ].map(({ icon: Icon, label, href }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              isActive(href)
                ? "bg-white/15 text-white"
                : "text-white/50 hover:bg-white/8 hover:text-white"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* 统计 */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-white/10 p-2 text-center">
            <div className="text-sm font-bold">{threads.length}</div>
            <div className="text-[10px] text-white/50">对话数</div>
          </div>
          <div className="rounded-md bg-white/10 p-2 text-center">
            <div className="text-sm font-bold">82%</div>
            <div className="text-[10px] text-white/50">正确率</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Helpers ───────────────────────────────────
interface ThreadSummary {
  id: string;
  title: string;
  createdAt: string;
}

function groupThreads(threads: ThreadSummary[]): Record<string, ThreadSummary[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, ThreadSummary[]> = {
    "今天": [],
    "昨天": [],
    "7 天内": [],
    "更早": [],
  };

  for (const t of threads) {
    const d = new Date(t.createdAt);
    if (d >= today) groups["今天"].push(t);
    else if (d >= yesterday) groups["昨天"].push(t);
    else if (d >= weekAgo) groups["7 天内"].push(t);
    else groups["更早"].push(t);
  }

  return groups;
}
