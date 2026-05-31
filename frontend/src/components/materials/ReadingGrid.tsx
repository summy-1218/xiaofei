"use client";

import { useEffect, useState } from "react";
import { Eye, Download, BookOpen } from "lucide-react";

interface Reading {
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
}

export function ReadingGrid({ courseCode }: { courseCode: string }) {
  const [list, setList] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/materials/reading?course_code=${courseCode}`)
      .then((r) => r.json())
      .then((data) => { setList(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [courseCode]);

  if (loading) {
    return (
      <div className="ppt-grid">
        {Array.from({ length: 1 }).map((_, i) => (
          <div key={i} className="ppt-card" style={{ height: 320, background: "#F4F4F6", borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="empty-card">
        <div className="empty-icon"><BookOpen size={28} /></div>
        <h3>暂无补充读物</h3>
        <p>后续将陆续上传推荐教材、参考资料等补充内容。</p>
      </div>
    );
  }

  return (
    <div className="ppt-grid">
      {list.map((item) => (
        <article key={item.id} className="ppt-card">
          <a href={`/materials/preview/${item.id}`} className="ppt-thumb">
            {item.thumbnailUrl ? (
              <img src={`http://localhost:8000${item.thumbnailUrl}`} alt={item.title} loading="lazy" />
            ) : (
              <div className="ppt-thumb-fallback">PDF</div>
            )}
            {item.pages > 0 && <span className="ppt-pages">{item.pages} 页</span>}
          </a>

          <div className="ppt-body">
            <div className="ppt-tagrow">
              <span className="ppt-tag" style={{ background: "rgba(239,68,68,0.14)", color: "#EF4444" }}>{item.tag}</span>
              <span className="ppt-size">{item.fileSize}</span>
            </div>
            <h3 className="ppt-title" title={item.title}>{item.title}</h3>
            {item.description && <p className="ppt-desc">{item.description}</p>}

            <div className="ppt-actions">
              <a className="ppt-btn-ghost" href={`/materials/preview/${item.id}`}>
                <Eye size={14} />在线浏览
              </a>
              <a className="ppt-btn-primary" href={`http://localhost:8000/api/materials/download/${item.id}`} download>
                <Download size={14} />下载
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
