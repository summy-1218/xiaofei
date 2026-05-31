"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageCircle, Eye, ThumbsUp, Sparkles, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCommunityStore } from "@/stores/community";

interface Post {
  id: string;
  chapterCode: string;
  author: { name: string; role: string };
  createdAt: string;
  title: string;
  excerpt: string;
  tags: string[];
  replyCount: number;
  viewCount: number;
  upvoteCount: number;
  status: string;
  hot: boolean;
  hasAiAnswer: boolean;
  aiAnswerSnippet?: string;
  aiCitations?: { type: string; refId: string; label: string }[];
  bookmarked: boolean;
}

function PostCard({ post }: { post: Post }) {
  const router = useRouter();

  return (
    <article className="post-card">
      <div className="post-head">
        <div className="post-avatar" />
        <div className="post-head-text">
          <div className="post-author-row">
            <span className="post-author">{post.author.name}</span>
            {post.author.role === "teacher" && <span className="badge role-badge role-teacher">教师</span>}
            <span className="post-time">{post.createdAt}</span>
          </div>
          <div className="post-badge-row">
            <span className={`badge ${post.status === "solved" ? "badge-solved" : "badge-open"}`}>
              {post.status === "solved" ? "已解决" : "待回答"}
            </span>
            {post.hot && <span className="badge badge-hot">🔥 热门</span>}
            {post.hasAiAnswer && <span className="badge badge-ai"><Sparkles size={11} /> 小飞已答</span>}
          </div>
        </div>
      </div>

      <div className="post-body" onClick={() => router.push(`/forum/${post.id}`)}>
        <h3 className="post-title" style={{ cursor: "pointer" }}>{post.title}</h3>
        <p className="post-excerpt">{post.excerpt}</p>
        {post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((t) => <span key={t} className="post-tag">#{t}</span>)}
          </div>
        )}
      </div>

      {post.hasAiAnswer && post.aiAnswerSnippet && (
        <details className="ai-answer-block">
          <summary>
            <Sparkles size={14} />
            <span>小飞的参考答案</span>
            <span className="ai-citations">
              {post.aiCitations?.slice(0, 3).map((c) => (
                <span key={c.refId} className={`citation citation-${c.type}`}>{c.label}</span>
              ))}
            </span>
          </summary>
          <div className="ai-answer-body">{post.aiAnswerSnippet}</div>
        </details>
      )}

      <footer className="post-actions">
        <button className="post-action"><ThumbsUp size={14} />{post.upvoteCount}</button>
        <button className="post-action"><MessageCircle size={14} />{post.replyCount} 回复</button>
        <span className="post-action post-action-static"><Eye size={14} />{post.viewCount} 浏览</span>
        <button className={`post-action post-action-right ${post.bookmarked ? "post-action-active" : ""}`}>
          <Bookmark size={14} />{post.bookmarked ? "已收藏" : "收藏"}
        </button>
      </footer>
    </article>
  );
}

export function PostFeed({ courseCode }: { courseCode: string }) {
  const view = useCommunityStore((s) => s.view);
  const statusFilters = useCommunityStore((s) => s.statusFilters);
  const sort = useCommunityStore((s) => s.sort);
  const query = useCommunityStore((s) => s.query);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ course_code: courseCode, view, sort });
    if (statusFilters.length) params.set("status", statusFilters.join(","));
    if (query) params.set("q", query);
    fetch(`http://localhost:8000/api/forum/posts?${params}`)
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [courseCode, view, statusFilters, sort, query]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="post-card" style={{ height: 180, background: "#F4F4F6", borderRadius: 14 }} />)}</div>;
  }

  if (posts.length === 0) {
    return <div className="empty-card"><p className="text-steel">没有匹配的帖子</p></div>;
  }

  return (
    <div className="space-y-3">
      {posts.map((p) => <PostCard key={p.id} post={p} />)}
    </div>
  );
}
