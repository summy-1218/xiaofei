import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

const ROOT = process.cwd();
const QUIZ_PATH = path.join(ROOT, "public", "data", "quiz", "081_modify_Wang.json");

// ── 编译时加载 quiz（3MB，避免运行时 trace） ─
let _quiz: any[] | null = null;
function loadQuiz(): any[] {
  if (_quiz) return _quiz;
  if (fs.existsSync(QUIZ_PATH)) _quiz = JSON.parse(fs.readFileSync(QUIZ_PATH, "utf-8"));
  else _quiz = [];
  return _quiz!;
}

// ── 编译时生成 materials 列表 ───────────────
const COURSE_DIR = path.join(ROOT, "public", "data", "courseware", "飞行原理");
let _mats: any[] | null = null;
function listMats() {
  if (_mats) return _mats;
  if (!fs.existsSync(COURSE_DIR)) { _mats = []; return []; }
  const chMap: Record<string, string> = { "1": "飞机与大气", "2": "空气动力学基础", "3": "高速空气动力学", "4": "螺旋桨空气动力学", "5": "稳定性与操纵性", "6": "飞行性能", "7": "特殊飞行条件" };
  _mats = fs.readdirSync(COURSE_DIR).filter((f) => f.endsWith(".pdf")).sort().map((f, i) => {
    const fp = path.join(COURSE_DIR, f); const mb = fs.statSync(fp).size / 1048576;
    const m = f.match(/^(\d+)-(\d+)\s*(.+)\.pdf$/);
    return { id: String(i + 1), chapter: chMap[m?.[1] || "0"] || "飞行原理", title: (m ? m[3] : f.replace(".pdf", "")).replace("  -  已修复", ""), filename: f, size: `${mb >= 1 ? mb.toFixed(1) + " MB" : (mb * 1024).toFixed(0) + " KB"}`, type: m ? "ppt" : "reading" };
  });
  return _mats!;
}

function getMat(id: string) { return listMats().find((m: any) => m.id === id); }
function strip(s: string): string {
  return (s || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\\n/g, "\n").replace(/\s+/g, " ").trim();
}
function chTag(t: string): string { const m = (t || "").match(/081-\d{2}/); return m ? m[0] : "081-01"; }

const CHAPTERS: Record<string, [string, string]> = {
  "081-01": ["亚音速空气动力学", "Subsonic Aerodynamics"],
  "081-02": ["螺旋桨", "Propellers"],
  "081-03": ["失速、马赫下俯与改出", "Stall, Mach Tuck and UPRT"],
  "081-04": ["稳定性", "Stability"],
  "081-05": ["操纵", "Control"],
  "081-06": ["限制", "Limitations"],
  "081-07": ["性能", "Performance"],
  "081-08": ["飞行力学", "Flight Mechanics"],
};

// ═══════════════════════════════════════════════
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: pathArr } = req.query;
  const segs = (Array.isArray(pathArr) ? pathArr : [pathArr]).filter(Boolean) as string[];
  const p = segs.join("/");
  const body = req.method === "POST" ? req.body : {};
  try {
    if (req.method === "GET") return handleGET(p, req, res);
    if (req.method === "POST") return handlePOST(p, body, res);
    res.status(405).json({});
  } catch (e: any) { res.status(500).json({ error: e.message }); }
}

function handleGET(p: string, req: NextApiRequest, res: NextApiResponse) {
  // Quiz
  if (p === "quiz/chapters") {
    const counts: Record<string, number> = {};
    for (const q of loadQuiz()) { const ch = chTag(q.tags || ""); counts[ch] = (counts[ch] || 0) + 1; }
    return res.json(Object.entries(CHAPTERS).map(([id, [name, en]]) => ({ id, course_id: "081", name: `${id} ${name}`, en_name: en, question_count: counts[id] || 0, progress: Math.random() * 0.9 })));
  }
  if (p === "quiz/stats") {
    const t = loadQuiz().length;
    return res.json([
      { key: "total", label: "总题量", value: t.toLocaleString() },
      { key: "attempted", label: "已练习", value: `${Math.floor(Math.random() * 500 + 200)} / ${Math.floor(Math.random() * 30 + 10)}%` },
      { key: "accuracy", label: "正确率", value: `${(70 + Math.random() * 20).toFixed(1)}%`, delta: { value: +(Math.random() * 5 + 1).toFixed(1), positive: true } },
      { key: "todayNew", label: "今日新增", value: `+${Math.floor(Math.random() * 30 + 5)}` },
    ]);
  }
  if (p === "quiz/quick") return res.json({ resume: { sessionId: "demo-1", chapterTitle: "亚音速空气动力学", cursor: 12, total: 30, accuracy: 83 }, wrongCount: 47, favCount: 23, mockReady: true });
  // Figures: redirect to /data/quiz/Figures/ (public static)
  if (p.startsWith("quiz/figures/")) { res.redirect(307, `/data/quiz/Figures/${p.replace("quiz/figures/", "")}`); return; }

  // Materials
  if (p === "materials/overview") {
    const ms = listMats(); const pc = ms.filter((m: any) => m.type !== "reading").length; const rc = ms.filter((m: any) => m.type === "reading").length;
    let tb = 0; for (const m of ms) { try { tb += fs.statSync(path.join(COURSE_DIR, m.filename)).size; } catch {} }
    const gb = tb / 1e9; return res.json({ pptCount: pc, videoCount: 0, readingCount: rc, totalSize: gb >= 0.1 ? `${gb.toFixed(1)} GB` : `${(tb / 1e6).toFixed(0)} MB`, weekNew: 0 });
  }
  if (p === "materials/tags") return res.json(["飞机与大气", "空气动力学基础", "高速空气动力学", "螺旋桨空气动力学", "稳定性与操纵性", "飞行性能", "特殊飞行条件"]);
  if (p === "materials/ppt") {
    const tag = (req.query.tag as string) || ""; const q = (req.query.q as string) || "";
    let ms = listMats().filter((m: any) => m.type !== "reading");
    if (tag) ms = ms.filter((m) => m.chapter === tag); if (q) { const ql = q.toLowerCase(); ms = ms.filter((m) => m.title.toLowerCase().includes(ql) || m.filename.toLowerCase().includes(ql)); }
    return res.json(ms.map((m: any) => ({ id: m.id, title: m.title, fileName: m.filename, fileSize: m.size, tag: m.chapter, thumbnailUrl: `/api/materials/thumbnail/${m.id}`, pages: 20 + Math.floor(Math.random() * 60), uploadedAt: "2025-03", viewCount: Math.floor(Math.random() * 300 + 10), downloadCount: Math.floor(Math.random() * 150 + 5), favorited: false })));
  }
  if (p === "materials/reading") return res.json(listMats().filter((m: any) => m.type === "reading").map((m: any) => ({ id: m.id, title: m.title, fileName: m.filename, fileSize: m.size, tag: "补充读物", thumbnailUrl: `/api/materials/thumbnail/${m.id}`, pages: 0, uploadedAt: "2025", viewCount: 0, downloadCount: 0, favorited: false })));
  // PDF download: redirect to public static
  if (p.startsWith("materials/download/")) { const m = getMat(p.replace("materials/download/", "")); if (!m) return res.status(404).end(""); res.redirect(307, `/data/courseware/飞行原理/${encodeURIComponent(m.filename)}`); return; }
  // Thumbnail: redirect to public static
  if (p.startsWith("materials/thumbnail/")) { res.redirect(307, `/data/thumbnails/${p.replace("materials/thumbnail/", "")}.png`); return; }

  // Forum
  if (p === "forum/pulse") return res.json({ totalPosts: 4, solvedRate: 25, todayNew: Math.floor(Math.random() * 3), myPending: Math.floor(Math.random() * 2) });
  if (p === "forum/chapters") return res.json([{ code: "081-01", title: "亚音速空气动力学" }, { code: "081-03", title: "失速/马赫下坠" }, { code: "081-04", title: "稳定性" }]);
  if (p === "forum/posts") {
    return res.json([
      { id: "1", title: "临界攻角和失速速度到底谁决定谁？", author: "航宇小明", role: "student", time: "05-30 09:20", excerpt: "复习 2-6 时发现很多题把速度、重量、构型和攻角混在一起考...", replyCount: 5, viewCount: 142, upvoteCount: 12, status: "open", hot: true, hasAiAnswer: true, tags: ["失速"], bookmarked: false, content: "复习 2-6 时发现很多题把速度、重量、构型和攻角混在一起考，想请教如何建立判断顺序。" },
      { id: "2", title: "重心前移为什么会增加杆力梯度？", author: "王老师", role: "teacher", time: "05-29 18:40", excerpt: "题库里多次出现 CG forward 与 stick force per g 的关系...", replyCount: 8, viewCount: 296, upvoteCount: 24, status: "solved", hot: true, hasAiAnswer: false, tags: ["稳定性"], bookmarked: true, content: "题库里多次出现 CG forward 与 stick force per g 的关系，求直观解释。" },
      { id: "3", title: "伯努利方程中静压和动压的物理意义？", author: "飞行新手", role: "student", time: "05-31 10:15", excerpt: "一直没搞明白 P 和动态压...", replyCount: 3, viewCount: 88, upvoteCount: 6, status: "open", hot: false, hasAiAnswer: true, tags: ["伯努利"], bookmarked: false, content: "一直没搞明白 P 和动态压分别代表什么。" },
    ]);
  }
  if (p.startsWith("forum/posts/")) {
    const pid = p.replace("forum/posts/", "");
    const repl: Record<string, any[]> = { "1": [{ id: "r1", author: "王老师", role: "teacher", time: "05-30 10:15", content: "失速的本质是攻角超过临界值。做题框架：1. 先判断临界攻角 2. 用 Vs=√(2W/ρSCLmax) 判断。" }] };
    const posts = [
      { id: "1", title: "临界攻角和失速速度到底谁决定谁？", author: "航宇小明", role: "student", time: "05-30 09:20", excerpt: "...", replyCount: 5, viewCount: 142, upvoteCount: 12, status: "open", hot: true, hasAiAnswer: true, tags: ["失速"], bookmarked: false, content: "复习 2-6 时发现很多题把速度、重量、构型和攻角混在一起考。" },
    ];
    const post = posts.find((x) => x.id === pid);
    if (!post) return res.status(404).json({});
    return res.json({ ...post, replies: repl[pid] || [] });
  }
  return res.status(404).json({});
}

function handlePOST(p: string, body: any, res: NextApiResponse) {
  if (p === "chat/send") {
    aiChat(body.message || "").then((reply) => {
      res.json({ thread_id: body.thread_id || "t-" + Date.now(), reply: { id: "ai-" + Date.now(), role: "assistant", content: reply, citations: [], created_at: new Date().toISOString() } });
    });
    return;
  }
  if (p === "quiz/practice") {
    const { mode, count, chapter_ids } = body;
    let pool = loadQuiz().map((item, idx) => {
      const ch = chTag(item.tags || "");
      return { id: String(item.eid || item.guid || idx), course_id: "081", chapter_id: ch, type: "单选题", difficulty: 2 + (idx % 3), title: strip(item.title || ""), options: { A: strip(item.optionA || ""), B: strip(item.optionB || ""), C: strip(item.optionC || ""), D: strip(item.optionD || "") }, correct: String(item.correctAns || "").trim().toUpperCase(), explanation: strip(item.explanationTotal || "") || "暂无解析", img: item["title-img"] ? `/api/quiz/figures/${item["title-img"]}` : "", ans_img: item["ans-img"] ? `/api/quiz/figures/${item["ans-img"]}` : "" };
    }).filter((q: any) => q.title && Object.keys(q.options).length >= 2 && q.correct);
    if (chapter_ids?.length) pool = pool.filter((q: any) => chapter_ids.includes(q.chapter_id));
    if (mode === "challenge") pool.sort((a: any, b: any) => b.difficulty - a.difficulty);
    const n = Math.max(1, Math.min(count || 9999, pool.length));
    if (mode === "challenge") return res.json({ questions: pool.slice(0, n) });
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return res.json({ questions: pool.slice(0, n) });
  }
  if (p === "quiz/submit") {
    const q = loadQuiz().find((item, idx) => String(item.eid || item.guid || idx) === body.question_id);
    if (!q) return res.json({ is_correct: false, explanation: "" });
    const is_correct = (body.answer || "").trim().toUpperCase() === String(q.correctAns || "").trim().toUpperCase();
    return res.json({ is_correct, correct_answer: String(q.correctAns || "").trim().toUpperCase(), explanation: strip(q.explanationTotal || "") });
  }
  if (p === "materials/list") return res.json(listMats().map((m: any) => { const { path: _p, ...rest } = m; return rest; }));
  if (p === "forum/posts") return res.json({ id: "99", title: body.title || "", author: "匿名用户", role: "student", time: "刚刚", content: body.content || "", replyCount: 0, viewCount: 1, upvoteCount: 0, status: "open", hot: false, hasAiAnswer: false, tags: [], bookmarked: false });
  return res.status(404).json({});
}

const SYSTEM_PROMPT = `你是"小飞"，北京航空航天大学飞行技术专业的AI学习助手。

## 身份与能力
- 知识渊博、耐心细致的航空教育导师，熟悉飞行技术专业全部核心课程
- 准确讲解飞行原理、航空气象、空中导航、航空仪表等
- 对计算题给出解题思路和方法引导，不直接给答案
- 关联不同课程中的相关知识
- 对安全相关知识特别强调其重要性

## 知识基础
- 飞行原理课程涵盖：飞机与大气、空气动力学基础（升力/阻力/失速）、高速空气动力学（激波/膨胀波/跨音速）、螺旋桨空气动力学、稳定性与操纵性、飞行性能（平飞/爬升/转弯/起降）、特殊飞行条件（单发/结冰/风切变）
- 核心公式：L=½ρV²SCL（升力）、D=½ρV²SCD（阻力）、Vs=√(2W/ρSCLmax)（失速速度）、伯努利 P+½ρv²=常数
- 参考教材：Oxford Principles of Flight, Jeppesen ATPL manuals

## 输出规范
- 使用 Markdown + LaTeX 组织：行内 $...$，独立公式 $$...$$
- 使用表格对比参数，分步骤讲解过程
- 关键概念首次出现时用粗体标注
- 不寒暄开头结尾，信息密度高
- 引用具体课程章节（如"参见 §2.6 失速特性"）`;

function buildContext(message: string): string {
  const q = message.toLowerCase();
  const context: string[] = [];

  // 匹配已知知识点
  const knowledge: [string[], string][] = [
    [["升力", "lift", "cl"], "## 升力公式\n$L=\\frac12\\rho V^2 S C_L$。平飞时 $L\\approx W$。速度增大需减小攻角。"],

    [["失速", "stall", "临界攻角"], "## 失速\n本质是攻角超过临界值（≈16°）。改出：推杆减攻角→保水平→加油门。失速速度 $V_s=\\sqrt{2W/\\rho S C_{L\\max}}$。"],

    [["伯努利", "bernoulli", "静压"], "## 伯努利原理\n$P+\\frac12\\rho v^2=常数$。流速增大→静压减小。用于解释机翼升力、空速测量。"],

    [["襟翼", "flap", "增升"], "## 襟翼\n| 起飞 | 5°-15° | 增升力 |\n| 着陆 | 30°-40° | 增升力+阻力 |\n增大机翼弯度→CLmax增加→失速速度降低。"],

    [["稳定", "stability", "静稳定"], "## 稳定性\n- **静稳定性**：受扰后回原状态趋势\n- **动稳定性**：随时间收敛/发散\n- 纵向：焦点vs重心位置\n- 横向：上反角效应\n- 航向：垂尾面积"],

    [["操纵", "control", "副翼", "升降舵"], "## 三轴操纵\n| 俯仰 | 升降舵 | 拉杆抬头 |\n| 滚转 | 副翼 | 压杆滚转 |\n| 偏航 | 方向舵 | 蹬舵偏转 |"],

    [["螺旋桨", "propeller", "桨叶"], "## 螺旋桨\n桨叶角、进距比、效率。附加效应：滑流、P-factor、反作用力矩。"],

    [["爬升", "climb", "下降", "descent"], "## 爬升性能\n$ROC=(P_w-P_{scr})/W$。Vx=最佳爬升角，Vy=最佳爬升率。重量、密度高度影响爬升率。"],

    [["高速", "马赫", "mach", "激波", "冲击波"], "## 高速空气动力学\n跨音速：局部激波→阻力骤增。面积律减小波阻。后掠角延迟激波。"],

    [["转弯", "盘旋", "turn"], "## 转弯性能\n协调转弯：$\\tan\\phi=V^2/(gR)$。载荷因数 $n=1/\\cos\\phi$。盘旋半径 $R=V^2/(g\\tan\\phi)$。"],

    [["起飞", "着陆", "takeoff", "landing"], "## 起飞与着陆\n起飞距离受重量、密度高度、风、襟翼影响。着陆距离=空中段+地面减速段。"],

    [["单发", "vmc", "engine failure"], "## 单发失效\n不对称推力→偏航+滚转。Vmc=最小操纵速度。关键发动机失效最危险。"],

    [["结冰", "污染", "icing"], "## 结冰影响\n升力↓阻力↑失速速度↑。防冰/除冰设备必须起飞前检查。"],

    [["风切变", "湍流", "turbulence", "gust"], "## 风场\n侧风起降需修正偏流角。风切变→空速突变→升力骤变。湍流穿透速度 Va。"],

    [["naca", "0012", "翼型", "airfoil"], "## NACA 0012 翼型\n对称翼型，零攻角升力为零。失速攻角约12°-16°。常用于尾翼和对称翼型教学。"],

    [["重心", "cg", "杆力", "stick force"], "## 重心与杆力\n重心前移→静稳定↑→杆力梯度↑。重心后移→稳定性↓→杆力轻但易飘。\n\n> 参考 §5.1 飞机的平衡及稳定性概念"],
  ];

  for (const [keywords, text] of knowledge) {
    if (keywords.some((k) => q.includes(k))) {
      context.push(text);
    }
  }

  return context.length > 0 ? context.join("\n\n---\n\n") : "";
}

async function aiChat(message: string): Promise<string> {
  try {
    const key = process.env.DEEPSEEK_API_KEY || "";
    const ctx = buildContext(message);

    const sysContent = ctx
      ? SYSTEM_PROMPT + `\n\n## 课程知识参考\n以下来自飞行原理课程资料，请融入回答中：\n\n${ctx}`
      : SYSTEM_PROMPT;

    if (!key) {
      // 无 API key 时用本地知识直接回复
      if (ctx) {
        const parts = ctx.split("\n\n---\n\n");
        const best = parts[0] || "";
        return best.replace(/^## /, "## ").trim() + "\n\n> 配置 DeepSeek API Key 可获得更详细的回答。";
      }
      return "未配置 `DEEPSEEK_API_KEY`。请到 Vercel → Settings → Environment Variables 添加。";
    }

    const resp = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: sysContent },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || "";
  } catch { return "AI 暂不可用。"; }
}
