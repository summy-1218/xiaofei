"use client";

import { useState, useEffect } from "react";
import { Paperclip, Image, Hash, Sparkles, Send, FileText } from "lucide-react";

const DRAFT_KEY = "community:draft:081";

export function Composer({ courseCode, onPost }: { courseCode: string; onPost: (title: string, content: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [wantAi, setWantAi] = useState(true);

  // 草稿恢复
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.title) setTitle(d.title);
        if (d.body) setBody(d.body);
      }
    } catch {}
  }, []);

  // 草稿持久化
  useEffect(() => {
    if (!expanded) return;
    const t = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, body }));
    }, 2000);
    return () => clearTimeout(t);
  }, [title, body, expanded]);

  const submit = () => {
    if (!title.trim() || !body.trim()) return;
    onPost(title.trim(), body.trim());
    setTitle(""); setBody(""); setExpanded(false);
    localStorage.removeItem(DRAFT_KEY);
  };

  if (!expanded) {
    return (
      <div className="composer composer-collapsed" onClick={() => setExpanded(true)} role="button" tabIndex={0}>
        <div className="composer-avatar" />
        <span className="composer-placeholder">发起一个飞行原理问题…</span>
        <div className="composer-quick">
          <button className="composer-icon-btn" aria-label="附件"><Paperclip size={16} /></button>
          <button className="composer-icon-btn" aria-label="图片"><Image size={16} /></button>
          <button className="composer-icon-btn" aria-label="关联题号"><Hash size={16} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="composer composer-expanded">
      <div className="composer-head">
        <div className="composer-avatar" />
        <span className="composer-name">提问中</span>
      </div>
      <input
        className="composer-title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题，例如：临界攻角和失速速度的关系"
        maxLength={120}
      />
      <textarea
        className="composer-body-input"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="写下你的思路、疑问或题目来源。支持 Markdown 与 LaTeX"
        rows={5}
      />
      <label className="composer-ai-toggle">
        <input type="checkbox" checked={wantAi} onChange={(e) => setWantAi(e.target.checked)} />
        <Sparkles size={14} />
        <span>发布时让小飞先给一个参考答案</span>
      </label>
      <div className="composer-footer">
        <div className="composer-tools">
          <button className="composer-icon-btn"><Paperclip size={16} /></button>
          <button className="composer-icon-btn"><Image size={16} /></button>
          <button className="composer-icon-btn"><FileText size={16} /></button>
        </div>
        <div className="composer-actions">
          <button className="btn-ghost text-sm" onClick={() => setExpanded(false)}>取消</button>
          <button className="btn-primary inline-flex items-center gap-2 text-sm" disabled={!title.trim() || !body.trim()} onClick={submit}>
            <Send size={14} />发布
          </button>
        </div>
      </div>
    </div>
  );
}
