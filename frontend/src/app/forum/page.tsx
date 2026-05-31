"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PulseStrip } from "@/components/community/PulseStrip";
import { ViewTabs } from "@/components/community/ViewTabs";
import { CommunityToolbar } from "@/components/community/CommunityToolbar";
import { Composer } from "@/components/community/Composer";
import { PostFeed } from "@/components/community/PostFeed";

export default function ForumPage() {
  const router = useRouter();
  const [feedKey, setFeedKey] = useState(0);

  const handlePost = useCallback(async (title: string, content: string) => {
    try {
      await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      setFeedKey((k) => k + 1);
    } catch {}
  }, []);

  return (
    <div className="main-flex flex flex-1 flex-col">
      <header className="main-header">
        <h1 className="text-[22px] font-semibold text-ink">讨论社区</h1>
        <p className="text-sm text-steel mt-1">
          飞行员自由讨论社区，关于飞行的一切——技术、经验、考试、职业发展。
        </p>
      </header>

      <div className="main-scroll flex-1 overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 32px 80px" }}>
          <PulseStrip courseCode="081" />
          <ViewTabs />
          <CommunityToolbar courseCode="081" />
          <Composer courseCode="081" onPost={handlePost} />
          <PostFeed key={feedKey} courseCode="081" />
        </div>
      </div>
    </div>
  );
}
