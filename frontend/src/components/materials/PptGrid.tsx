"use client";

import { useEffect, useState } from "react";
import { Eye, Download, Star, MoreHorizontal } from "lucide-react";
import { useMaterialsStore } from "@/stores/materials";

interface Ppt {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: string;
  tag: string;
  thumbnailUrl?: string;
  pages: number;
  uploadedAt: string;
  viewCount: number;
  downloadCount: number;
  favorited?: boolean;
}

function PptCard({ ppt }: { ppt: Ppt }) {
  return (
    <article className="ppt-card">
      <a href={`/materials/preview/${ppt.id}`} className="ppt-thumb">
        {ppt.thumbnailUrl ? (
          <img src={`http://localhost:8000${ppt.thumbnailUrl}`} alt={ppt.title} loading="lazy" />
        ) : (
          <div className="ppt-thumb-fallback">PPT</div>
        )}
        <span className="ppt-pages">{ppt.pages} 页</span>
      </a>

      <div className="ppt-body">
        <div className="ppt-tagrow">
          <span className="ppt-tag">{ppt.tag}</span>
          <span className="ppt-size">{ppt.fileSize}</span>
        </div>
        <h3 className="ppt-title" title={ppt.title}>{ppt.title}</h3>
        {ppt.description && <p className="ppt-desc">{ppt.description}</p>}
        <div className="ppt-meta">
          <span title={ppt.fileName}>{ppt.fileName}</span>
          <span className="ppt-meta-dot">·</span>
          <span>{ppt.uploadedAt}</span>
          <span className="ppt-meta-dot">·</span>
          <span>浏览 {ppt.viewCount}</span>
        </div>

        <div className="ppt-actions">
          <a className="ppt-btn-ghost" href={`/materials/preview/${ppt.id}`}>
            <Eye size={14} />在线浏览
          </a>
          <a
            className="ppt-btn-primary"
            href={`http://localhost:8000/api/materials/download/${ppt.id}`}
            download
          >
            <Download size={14} />下载
          </a>
          <button className="ppt-btn-icon" aria-pressed={ppt.favorited}>
            <Star size={16} />
          </button>
          <button className="ppt-btn-icon">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

function PptRow({ ppt }: { ppt: Ppt }) {
  return (
    <div className="ppt-row">
      <span className="ppt-tag ppt-tag-sm">{ppt.tag}</span>
      <span className="ppt-title-sm">{ppt.title}</span>
      <span className="text-xs text-muted">{ppt.fileSize}</span>
      <span className="text-xs text-muted">{ppt.uploadedAt}</span>
      <span className="text-xs text-muted">浏览 {ppt.viewCount}</span>
      <div className="ppt-actions" style={{ border: 0, margin: 0, padding: 0 }}>
        <a className="ppt-btn-ghost" href={`/materials/preview/${ppt.id}`}><Eye size={14} /></a>
        <a className="ppt-btn-primary" href={`http://localhost:8000/api/materials/download/${ppt.id}`} download><Download size={14} /></a>
      </div>
    </div>
  );
}

export function PptGrid({ courseCode }: { courseCode: string }) {
  const tag = useMaterialsStore((s) => s.tag);
  const query = useMaterialsStore((s) => s.query);
  const sort = useMaterialsStore((s) => s.sort);
  const view = useMaterialsStore((s) => s.view);

  const [list, setList] = useState<Ppt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ course_code: courseCode, sort });
    if (tag) params.set("tag", tag);
    if (query) params.set("q", query);
    fetch(`http://localhost:8000/api/materials/ppt?${params}`)
      .then((r) => r.json())
      .then((data) => { setList(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [courseCode, tag, query, sort]);

  if (loading) {
    return (
      <div className={view === "grid" ? "ppt-grid" : "ppt-list"}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="ppt-card" style={{ height: 320, background: "#F4F4F6", borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="empty-card">
        <p className="text-steel">没有匹配的课件资料</p>
      </div>
    );
  }

  if (view === "list") {
    return <div className="ppt-list">{list.map((p) => <PptRow key={p.id} ppt={p} />)}</div>;
  }

  return (
    <div className="ppt-grid">
      {list.map((p) => <PptCard key={p.id} ppt={p} />)}
    </div>
  );
}
