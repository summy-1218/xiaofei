"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, FileWarning } from "lucide-react";

interface MaterialInfo {
  id: string;
  title: string;
  filename?: string;
  fileName?: string;
  fileSize: string;
  size?: string;
}

function getBasename(m: MaterialInfo): string {
  return m.filename || m.fileName || "";
}

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const materialId = (params?.id ?? "") as string;
  const [material, setMaterial] = useState<MaterialInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/materials/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then((list) => {
        const found = list.find((m: any) => m.id === materialId);
        setMaterial(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [materialId]);

  const fname = (material as any)?.fileName || (material as any)?.filename || "";
  const isPPT = fname.toLowerCase().endsWith(".ppt") || fname.toLowerCase().endsWith(".pptx");
  const isPDF = fname.toLowerCase().endsWith(".pdf");
  const downloadUrl = `/api/materials/download/${materialId}`;
  const previewUrl = `/api/materials/download/${materialId}?inline=1`;
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");

  // fetch PDF as blob to avoid cross-origin iframe issues
  useEffect(() => {
    if (!material || !isPDF) return;
    let cancelled = false;
    fetch(previewUrl)
      .then((r) => r.blob())
      .then((blob) => {
        if (!cancelled) setPdfBlobUrl(URL.createObjectURL(blob));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [materialId, material]);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-steel">加载中...</p>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <p className="text-steel">资料未找到</p>
        <button onClick={() => router.back()} className="btn-secondary">
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 main-flex">
      {/* TopBar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#EDEDEC] px-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            className="rounded-md p-1.5 text-steel hover:bg-surface transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm font-medium text-ink truncate">
            {material.title}
          </span>
        </div>
        <a
          href={downloadUrl}
          download={getBasename(material)}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <Download size={16} /> 下载
        </a>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isPDF ? (
          pdfBlobUrl ? (
            <object
              data={pdfBlobUrl}
              type="application/pdf"
              className="w-full h-full border-0"
              title={material.title}
            >
              <p className="text-steel p-4">无法加载 PDF，请<a href={downloadUrl} className="text-link-blue underline">下载</a>后查看</p>
            </object>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-steel">加载 PDF 中...</p>
            </div>
          )
        ) : isPPT ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
              <FileWarning size={32} className="text-amber-500" />
            </div>
            <h2 className="text-heading-4 text-ink">当前不支持预览 PPT 格式文件</h2>
            <p className="text-body-md text-steel text-center max-w-sm">
              PPT/PPTX 文件暂时无法在线预览，请下载后使用 PowerPoint 或其他软件打开。
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="btn-secondary">
                返回
              </button>
              <a
                href={downloadUrl}
                download={getBasename(material)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Download size={16} /> 下载（{(material.fileSize || material.size || "")}）
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
            <p className="text-steel">该文件格式暂不支持预览</p>
            <a
              href={downloadUrl}
              download={getBasename(material)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Download size={16} /> 下载
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
