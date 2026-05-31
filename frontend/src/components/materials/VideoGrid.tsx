"use client";

import { Sparkles, Upload } from "lucide-react";

export function VideoGrid({ courseCode }: { courseCode: string }) {
  return (
    <div className="empty-card">
      <div className="empty-icon">
        <Sparkles size={28} />
      </div>
      <h3>视频素材即将上线</h3>
      <p>后台接口已预留，支持上传 OSS 视频、嵌入 B 站 / 腾讯视频 / YouTube 外链。</p>
      <button className="btn-primary inline-flex items-center gap-2">
        <Upload size={14} />上传首个视频
      </button>
    </div>
  );
}
