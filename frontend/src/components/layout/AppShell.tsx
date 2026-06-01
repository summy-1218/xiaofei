"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div id="root" className="flex h-full overflow-hidden">
      {/* ── 桌面侧边栏 ────────────────── */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* ── 移动端侧边栏浮层 ────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px]">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── 主内容区 ───────────────────── */}
      <main className="main-flex flex flex-1 flex-col bg-canvas">
        {/* 移动端顶栏 */}
        <div className="flex md:hidden items-center gap-3 px-4 h-12 border-b border-[#EDEDEC] shrink-0 bg-white">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-steel">
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-ink">✈️ 小飞</span>
        </div>
        {children}
      </main>
    </div>
  );
}
