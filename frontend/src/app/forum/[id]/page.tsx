"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, ThumbsUp, MessageCircle, Eye, Sparkles, Bookmark } from "lucide-react";

interface PostDetail {
  id: string;
  title: string;
  content: string;
  author: { name: string; role: string };
  createdAt: string;
  tags: string[];
  replyCount: number;
  viewCount: number;
  upvoteCount: number;
  status: string;
  hasAiAnswer: boolean;
  aiAnswerSnippet?: string;
  aiCitations?: { type: string; refId: string; label: string }[];
  replies: { id: string; author: { name: string; role: string }; createdAt: string; content: string }[];
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetch(`/api/forum/posts/${postId}`)
      .then((r) => r.json())
      .then((data) => { setPost(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [postId]);

  const submitReply = () => {
    if (!replyText.trim()) return;
    setPost((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        replyCount: prev.replyCount + 1,
        replies: [...prev.replies, {
          id: `r${Date.now()}`,
          author: { name: "当前用户", role: "student" },
          createdAt: "刚刚",
          content: replyText.trim(),
        }],
      };
    });
    setReplyText("");
  };

  if (loading) {
    return <div className="flex items-center justify-center flex-1"><p className="text-steel">加载中...</p></div>;
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <p className="text-steel">帖子未找到</p>
        <button onClick={() => router.push("/forum")} className="btn-secondary">返回社区</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 main-flex">
      {/* TopBar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#EDEDEC] px-4">
        <button onClick={() => router.push("/forum")} className="flex items-center gap-2 text-sm text-steel hover:text-ink transition-colors">
          <ArrowLeft size={16} /> 返回社区
        </button>
        <span className="text-xs text-muted">{post.viewCount} 浏览 · {post.replyCount} 回复</span>
      </header>

      {/* 内容区（可滚动） */}
      <div className="flex-1 overflow-y-auto main-flex">
        <div className="mx-auto max-w-[720px] px-4 py-6">
          {/* 帖子主体 */}
          <article className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #7C5CFF, #F59E0B)" }} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{post.author.name}</span>
                  {post.author.role === "teacher" && <span className="badge role-teacher text-[10px]">教师</span>}
                </div>
                <span className="text-xs text-muted">{post.createdAt}</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className={`badge ${post.status === "solved" ? "badge-solved" : "badge-open"}`}>
                  {post.status === "solved" ? "已解决" : "待回答"}
                </span>
              </div>
            </div>

            <h1 className="text-heading-3 text-ink mb-4">{post.title}</h1>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((t) => <span key={t} className="post-tag text-sm">#{t}</span>)}
              </div>
            )}

            <div className="text-base leading-relaxed text-ink whitespace-pre-wrap">
              {post.content}
            </div>

            {/* AI 答案 */}
            {post.hasAiAnswer && post.aiAnswerSnippet && (
              <details className="ai-answer-block mt-4">
                <summary>
                  <Sparkles size={14} /><span>小飞的参考答案</span>
                </summary>
                <div className="ai-answer-body">{post.aiAnswerSnippet}</div>
              </details>
            )}

            {/* 互动栏 */}
            <div className="post-actions mt-6">
              <button className="post-action"><ThumbsUp size={16} />{post.upvoteCount}</button>
              <span className="post-action post-action-static"><MessageCircle size={16} />{post.replyCount} 回复</span>
              <span className="post-action post-action-static"><Eye size={16} />{post.viewCount} 浏览</span>
              <button className="post-action post-action-right"><Bookmark size={16} />收藏</button>
            </div>
          </article>

          {/* 分割线 */}
          <div className="border-t border-hairline pt-6 mb-6">
            <h2 className="text-heading-5 text-ink mb-4">回复 ({post.replies.length})</h2>
          </div>

          {/* 回复列表 */}
          <div className="space-y-4 mb-8">
            {post.replies.map((r) => (
              <div key={r.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex-shrink-0" style={{
                  background: r.author.role === "teacher"
                    ? "linear-gradient(135deg, #7C5CFF, #5645d4)"
                    : "linear-gradient(135deg, #22D3EE, #7C5CFF)",
                }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-ink">{r.author.name}</span>
                    {r.author.role === "teacher" && <span className="badge role-teacher text-[10px]">教师</span>}
                    <span className="text-xs text-muted">{r.createdAt}</span>
                  </div>
                  <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{r.content}</p>
                </div>
              </div>
            ))}
            {post.replies.length === 0 && (
              <p className="text-sm text-steel text-center py-8">暂无回复，来发表第一条讨论吧</p>
            )}
          </div>
        </div>
      </div>

      {/* 底部回复框 */}
      <footer className="shrink-0 border-t border-[#EDEDEC] bg-white px-4 py-3">
        <div className="mx-auto max-w-[720px] flex items-end gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="写下你的回复... (Enter 发送，Shift+Enter 换行)"
            rows={1}
            className="flex-1 resize-none input-base min-h-[40px] max-h-[120px] py-2.5 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitReply(); }
            }}
          />
          <button onClick={submitReply} disabled={!replyText.trim()} className="btn-primary h-[40px] px-4 flex items-center gap-2 shrink-0 disabled:opacity-40">
            <Send size={14} />回复
          </button>
        </div>
      </footer>
    </div>
  );
}
