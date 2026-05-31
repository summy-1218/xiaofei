"use client";

import { useEffect } from "react";
import { ResourceOverview } from "@/components/materials/ResourceOverview";
import { TypeTabs } from "@/components/materials/TypeTabs";
import { ToolbarRow } from "@/components/materials/ToolbarRow";
import { PptGrid } from "@/components/materials/PptGrid";
import { VideoGrid } from "@/components/materials/VideoGrid";
import { ReadingGrid } from "@/components/materials/ReadingGrid";
import { useMaterialsStore } from "@/stores/materials";

export default function MaterialsPage() {
  const activeType = useMaterialsStore((s) => s.activeType);
  const setCounts = useMaterialsStore((s) => s.setCounts);

  useEffect(() => {
    fetch("http://localhost:8000/api/materials/overview?course_code=081")
      .then((r) => r.json())
      .then((d) => setCounts({ pptCount: d.pptCount, videoCount: d.videoCount, readingCount: d.readingCount }))
      .catch(() => {});
  }, []);

  return (
    <div className="main-flex flex flex-1 flex-col">
      <header className="main-header">
        <h1 className="text-[22px] font-semibold text-ink">课程资料</h1>
        <p className="text-sm text-steel mt-1">
          飞行原理课程资料，支持章节筛选、搜索、在线浏览和下载。
        </p>
      </header>

      <div className="main-scroll flex-1 overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 32px 80px" }}>
          {/* Block 1: 资源概览条 */}
          <ResourceOverview courseCode="081" />

          {/* Block 2: 类型 Tab */}
          <TypeTabs />

          {/* Block 3: 工具栏 */}
          <ToolbarRow />

          {/* Block 4/5: 内容区 */}
          {activeType === "ppt" && <PptGrid courseCode="081" />}
          {activeType === "video" && <VideoGrid courseCode="081" />}
          {activeType === "reading" && <ReadingGrid courseCode="081" />}
        </div>
      </div>
    </div>
  );
}
