"use client";

import Link from "next/link";
import { Bell, UserCircle } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-hairline bg-canvas px-6 shrink-0">
      {/* 面包屑 / 标题 */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-steel">你好，航宇小明</span>
      </div>

      {/* 右侧操作 */}
      <div className="flex items-center gap-3">
        <button className="relative rounded-md p-2 text-steel hover:bg-surface transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error" />
        </button>
        <button className="flex items-center gap-2 rounded-md p-1.5 text-steel hover:bg-surface transition-colors">
          <UserCircle size={24} />
        </button>
      </div>
    </header>
  );
}
