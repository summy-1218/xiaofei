"use client";

import { Sidebar } from "./Sidebar";

/**
 * AppShell — 三层容器骨架
 *
 * <AppShell>                  ← flex row, h-full
 *   <Sidebar/>                ← 260px, shrink-0
 *   <Main>                    ← flex-1, flex col, min-height:0  (关键!)
 *     {children}             ← 页面内容自行管理 flex
 *   </Main>
 * </AppShell>
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div id="root" className="flex h-full overflow-hidden">
      <Sidebar />
      <main className="main-flex flex flex-1 flex-col bg-canvas">
        {children}
      </main>
    </div>
  );
}
