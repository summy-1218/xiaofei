"use client";

import Link from "next/link";
import { MessageCircle, Clock } from "lucide-react";
import { type ChatSession } from "@/lib/api";

interface RecentConversationsProps {
  sessions: ChatSession[];
}

export function RecentConversations({ sessions }: RecentConversationsProps) {
  if (sessions.length === 0) {
    return (
      <div className="card-base">
        <h3 className="flex items-center gap-2 text-heading-5 text-ink mb-3">
          <Clock size={18} />
          最近对话
        </h3>
        <p className="text-body-sm text-steel py-4 text-center">还没有对话记录</p>
        <p className="text-body-sm text-muted text-center">开始你的第一次提问吧</p>
      </div>
    );
  }

  return (
    <div className="card-base">
      <h3 className="flex items-center gap-2 text-heading-5 text-ink mb-4">
        <Clock size={18} />
        最近对话
      </h3>
      <div className="space-y-2">
        {sessions.slice(0, 5).map((session) => (
          <Link
            key={session.id}
            href={`/?session=${session.id}`}
            className="flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-surface group"
          >
            <MessageCircle size={16} className="text-steel group-hover:text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-body-sm text-ink truncate">{session.title}</div>
              <div className="text-micro text-stone">{session.updated_at} · {session.message_count} 条消息</div>
            </div>
          </Link>
        ))}
      </div>
      {sessions.length > 5 && (
        <Link href="/history" className="block mt-3 text-body-sm text-link-blue hover:text-link-blue-pressed text-center">
          查看全部对话 →
        </Link>
      )}
    </div>
  );
}
