"use client";

import { useRouter } from "next/navigation";
import { useThreadStore, generateThreadId } from "@/lib/store";
import { Composer } from "@/components/chat/Composer";
import { MessageCircle } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { createThread, listThreads } = useThreadStore();
  const recentThreads = listThreads().slice(0, 3);

  const handleSubmit = (prompt: string) => {
    // 生成临时 threadId 用于本地存储和导航
    // 后端会在首次 /send 时返回正式的 thread_id，Thread 页会自动同步 URL
    const localId = generateThreadId();
    createThread(localId);
    useThreadStore.getState().addMessage(localId, {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      created_at: new Date().toISOString(),
    });
    router.push(`/thread/${localId}`);
  };

  return (
    <div className="flex flex-col items-center flex-1">
      <div style={{ height: "18vh" }} />

      <div className="text-center mb-10">
        <div className="text-5xl mb-4">✈️</div>
        <h1 className="text-heading-2 text-ink mb-2">
          小飞，今天想精进哪个知识点？
        </h1>
        <p className="text-body-md text-steel">
          飞行学员的 24 小时智能学习助手
        </p>
      </div>

      <Composer mode="hero" onSubmit={handleSubmit} />

      {recentThreads.length > 0 && (
        <div className="mt-12 w-full max-w-[720px]">
          <p className="text-xs text-muted mb-3 text-center">
            📂 最近 {recentThreads.length} 条对话
          </p>
          <div className="space-y-1">
            {recentThreads.map((t) => (
              <button
                key={t.id}
                onClick={() => router.push(`/thread/${t.id}`)}
                className="flex items-center gap-3 w-full rounded-md p-2 text-left transition-colors hover:bg-surface group"
              >
                <MessageCircle size={14} className="text-steel group-hover:text-primary shrink-0" />
                <span className="text-body-sm text-ink truncate flex-1">{t.title}</span>
                <span className="text-micro text-muted shrink-0">{t.messages.length} 条</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />
    </div>
  );
}
