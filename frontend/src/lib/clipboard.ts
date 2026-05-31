/** 拷贝回复工具 v1.1 — MD / 富文本 / 纯文本三种格式 */

export type CopyFormat = "md" | "rich" | "plain";

function latexToReadable(s: string): string {
  return s
    .replace(/\\tfrac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
    .replace(/\\rho/g, "ρ").replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β").replace(/\\theta/g, "θ")
    .replace(/\\cdot/g, "·").replace(/\\times/g, "×")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\^(\d)/g, (_: string, d: string) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d] || d)
    .replace(/_(\d)/g, (_: string, d: string) => "₀₁₂₃₄₅₆₇₈₉"[+d] || d)
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}]/g, "");
}

export function stripToPlain(md: string): string {
  // 简易纯文本：替换 LaTeX → 可读形式，去 Markdown 标记
  return md
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, eq) => `\n${latexToReadable(eq)}\n`)
    .replace(/\$([^$\n]+?)\$/g, (_, eq) => latexToReadable(eq))
    .replace(/[#*`>~\[\]()|]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function copyMessage(content: string, format: CopyFormat) {
  if (format === "md") {
    await navigator.clipboard.writeText(content);
    return;
  }
  if (format === "plain") {
    await navigator.clipboard.writeText(stripToPlain(content));
    return;
  }
  // rich: 同时写入 HTML + plain 两种 MIME
  const plain = stripToPlain(content);
  const container = document.createElement("div");
  container.innerHTML = content
    .replace(/\$\$(.+?)\$\$/g, "<div style='padding:4px 0'>$$$1$$</div>")
    .replace(/\$(.+?)\$/g, "<span>$1</span>")
    .replace(/\n/g, "<br>");
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([container.innerHTML], { type: "text/html" }),
      "text/plain": new Blob([plain], { type: "text/plain" }),
    }),
  ]);
}
