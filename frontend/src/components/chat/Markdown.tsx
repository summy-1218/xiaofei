"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useMemo } from "react";

// ── 渲染前清洗：剥离 raw LaTeX 与 KaTeX 并存的双渲染残留 ──
function sanitizeMath(md: string): string {
  return md
    // 去除连续重复变量名 (CLCL → CL)
    .replace(/([A-Za-zρα-ωΩ])\1{1,3}(?=[^A-Za-z\\])/g, "$1")
    // Unicode 上下标 → LaTeX
    .replace(/²/g, "^2").replace(/³/g, "^3")
    .replace(/½/g, "\\tfrac{1}{2}")
    // 空公式清理
    .replace(/\$\s*\$/g, "");
}

export function Markdown({ children }: { children: string }) {
  const cleaned = useMemo(() => sanitizeMath(children), [children]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        a: (props) => <a {...props} target="_blank" rel="noreferrer" className="text-link-blue underline" />,
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-hairline bg-surface px-3 py-2 text-left font-semibold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border border-hairline px-3 py-2">{children}</td>
        ),
        pre: ({ children }) => (
          <pre className="overflow-x-auto rounded-md bg-surface p-4 text-[13px]">{children}</pre>
        ),
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="rounded bg-hairline px-1 py-0.5 text-[13px] text-charcoal" {...props}>
                {children}
              </code>
            );
          }
          return <code className={className} {...props}>{children}</code>;
        },
      }}
    >
      {cleaned}
    </ReactMarkdown>
  );
}
