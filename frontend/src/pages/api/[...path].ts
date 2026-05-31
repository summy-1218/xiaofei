import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), "..");
const QUIZ_PATH = path.join(ROOT, "data", "quiz", "081_modify_Wang.json");
const COURSE_DIR = path.join(ROOT, "data", "courseware", "飞行原理");
const THUMBS_DIR = path.join(ROOT, "data", "thumbnails");
const FIGURES_DIR = path.join(ROOT, "data", "quiz", "Figures");

function loadQuiz(): any[] {
  if (!fs.existsSync(QUIZ_PATH)) return [];
  return JSON.parse(fs.readFileSync(QUIZ_PATH, "utf-8"));
}
function strip(s: string): string {
  return (s || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\\n/g, "\n").replace(/\s+/g, " ").trim();
}
function chTag(t: string): string { const m = (t || "").match(/081-\d{2}/); return m ? m[0] : "081-01"; }

function listMats() {
  if (!fs.existsSync(COURSE_DIR)) return [];
  return fs.readdirSync(COURSE_DIR).filter((f) => f.endsWith(".pdf")).sort().map((f, i) => {
    const fp = path.join(COURSE_DIR, f); const mb = fs.statSync(fp).size / 1048576;
    const m = f.match(/^(\d+)-(\d+)\s*(.+)\.pdf$/);
    const chMap: Record<string, string> = { "1": "飞机与大气", "2": "空气动力学基础", "3": "高速空气动力学", "4": "螺旋桨空气动力学", "5": "稳定性与操纵性", "6": "飞行性能", "7": "特殊飞行条件" };
    return { id: String(i + 1), chapter: chMap[m?.[1] || "0"] || "飞行原理", title: (m ? m[3] : f.replace(".pdf", "")).replace("  -  已修复", ""), filename: f, size: `${mb >= 1 ? mb.toFixed(1) + " MB" : (mb * 1024).toFixed(0) + " KB"}`, type: m ? "ppt" : "reading", path: fp };
  });
}
function getMat(id: string) { return listMats().find((m: any) => m.id === id); }

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { path: pathArr } = req.query;
    const segs = (Array.isArray(pathArr) ? pathArr : [pathArr]).filter(Boolean) as string[];
    const p = segs.join("/");
    const body = req.method === "POST" ? req.body : {};

    if (req.method === "GET") return handleGET(p, req, res);
    if (req.method === "POST") return handlePOST(p, body, res);
    return res.status(405).json({});
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
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
  if (p.startsWith("quiz/figures/")) {
    const fp = path.join(FIGURES_DIR, p.replace("quiz/figures/", ""));
    if (!fs.existsSync(fp)) return res.status(404).end("");
    res.setHeader("Content-Type", "image/png");
    return res.send(fs.readFileSync(fp));
  }

  // Materials
  if (p === "materials/overview") {
    const ms = listMats();
    const pc = ms.filter((m: any) => m.type !== "reading").length;
    const rc = ms.filter((m: any) => m.type === "reading").length;
    let tb = 0;
    for (const m of ms as any[]) { try { tb += fs.statSync(m.path).size; } catch {} }
    const gb = tb / 1e9;
    return res.json({ pptCount: pc, videoCount: 0, readingCount: rc, totalSize: gb >= 0.1 ? `${gb.toFixed(1)} GB` : `${(tb / 1e6).toFixed(0)} MB`, weekNew: Math.floor(Math.random() * 3) });
  }
  if (p === "materials/tags") return res.json(["飞机与大气", "空气动力学基础", "高速空气动力学", "螺旋桨空气动力学", "稳定性与操纵性", "飞行性能", "特殊飞行条件"]);
  if (p === "materials/ppt") {
    const tag = (req.query.tag as string) || ""; const q = (req.query.q as string) || "";
    let ms = listMats().filter((m: any) => m.type !== "reading");
    if (tag) ms = ms.filter((m) => m.chapter === tag);
    if (q) { const ql = q.toLowerCase(); ms = ms.filter((m) => m.title.toLowerCase().includes(ql) || m.filename.toLowerCase().includes(ql)); }
    return res.json(ms.map((m: any) => ({ id: m.id, title: m.title, description: "课件", fileName: m.filename, fileSize: m.size, tag: m.chapter, thumbnailUrl: `/api/materials/thumbnail/${m.id}`, pages: 20 + Math.floor(Math.random() * 60), uploadedAt: "2025-03", viewCount: Math.floor(Math.random() * 300 + 10), downloadCount: Math.floor(Math.random() * 150 + 5), favorited: false })));
  }
  if (p === "materials/reading") {
    return res.json(listMats().filter((m: any) => m.type === "reading").map((m: any) => ({ id: m.id, title: m.title, description: "补充读物", fileName: m.filename, fileSize: m.size, tag: "补充读物", thumbnailUrl: `/api/materials/thumbnail/${m.id}`, pages: 0, uploadedAt: "2025", viewCount: 0, downloadCount: 0, favorited: false })));
  }
  if (p.startsWith("materials/download/")) {
    const m = getMat(p.replace("materials/download/", ""));
    if (!m) return res.status(404).end("");
    res.setHeader("Content-Type", "application/pdf");
    return res.send(fs.readFileSync((m as any).path));
  }
  if (p.startsWith("materials/thumbnail/")) {
    const tp = path.join(THUMBS_DIR, `${p.replace("materials/thumbnail/", "")}.png`);
    if (!fs.existsSync(tp)) return res.status(404).end("");
    res.setHeader("Content-Type", "image/png");
    return res.send(fs.readFileSync(tp));
  }

  // Forum
  if (p === "forum/pulse") return res.json({ totalPosts: 3, solvedRate: 25, todayNew: Math.floor(Math.random() * 3), myPending: Math.floor(Math.random() * 2) });
  if (p === "forum/chapters") return res.json([{ code: "081-01", title: "亚音速空气动力学" }, { code: "081-03", title: "失速/马赫下坠" }, { code: "081-04", title: "稳定性" }]);
  if (p === "forum/posts") {
    const POSTS = [
      { id: "1", title: "临界攻角和失速速度到底谁决定谁？", author: "航宇小明", role: "student", time: "05-30 09:20", content: "复习 2-6 时发现很多题把速度、重量、构型和攻角混在一起考。", excerpt: "复习 2-6 时发现很多题把速度、重量、构型和攻角混在一起考...", replyCount: 5, viewCount: 142, upvoteCount: 12, status: "open", hot: true, hasAiAnswer: true, tags: ["失速"], bookmarked: false },
      { id: "2", title: "重心前移为什么会增加杆力梯度？", author: "王老师", role: "teacher", time: "05-29 18:40", content: "题库里多次出现 CG forward 与 stick force per g 的关系。", excerpt: "题库里多次出现 CG forward...", replyCount: 8, viewCount: 296, upvoteCount: 24, status: "solved", hot: true, hasAiAnswer: false, tags: ["稳定性"], bookmarked: true },
      { id: "3", title: "伯努利方程中静压和动压的物理意义？", author: "飞行新手", role: "student", time: "05-31 10:15", content: "一直没搞明白 P 和动态压分别代表什么。", excerpt: "一直没搞明白...", replyCount: 3, viewCount: 88, upvoteCount: 6, status: "open", hot: false, hasAiAnswer: true, tags: ["伯努利"], bookmarked: false },
    ];
    return res.json(POSTS);
  }
  if (p.startsWith("forum/posts/")) {
    const pid = p.replace("forum/posts/", "");
    const REPLIES: Record<string, any[]> = { "1": [{ id: "r1", author: "王老师", role: "teacher", time: "05-30 10:15", content: "失速的本质是攻角超过临界值。做题框架：1. 先判断临界攻角 2. 用 Vs=√(2W/ρSCLmax) 判断。" }] };
    const POSTS = [
      { id: "1", title: "临界攻角和失速速度到底谁决定谁？", author: "航宇小明", role: "student", time: "05-30 09:20", content: "复习 2-6 时发现很多题把速度、重量、构型和攻角混在一起考。", excerpt: "...", replyCount: 5, viewCount: 142, upvoteCount: 12, status: "open", hot: true, hasAiAnswer: true, tags: ["失速"], bookmarked: false },
      { id: "2", title: "重心前移为什么会增加杆力梯度？", author: "王老师", role: "teacher", time: "05-29 18:40", content: "题库里多次出现 CG forward 与 stick force per g 的关系。", excerpt: "...", replyCount: 8, viewCount: 296, upvoteCount: 24, status: "solved", hot: true, hasAiAnswer: false, tags: ["稳定性"], bookmarked: true },
    ];
    const post = POSTS.find((x) => x.id === pid);
    if (!post) return res.status(404).json({});
    return res.json({ ...post, replies: REPLIES[pid] || [] });
  }

  return res.status(404).json({});
}

function handlePOST(p: string, body: any, res: NextApiResponse) {
  // Chat
  if (p === "chat/send") {
    aiChat(body.message || "").then((reply) => {
      res.json({ thread_id: body.thread_id || "t-" + Date.now(), reply: { id: "ai-" + Date.now(), role: "assistant", content: reply, citations: [], created_at: new Date().toISOString() } });
    });
    return;
  }

  // Quiz
  if (p === "quiz/practice") {
    const { mode, count, chapter_ids } = body;
    let pool = loadQuiz().map((item, idx) => {
      const ch = chTag(item.tags || "");
      return { id: String(item.eid || item.guid || idx), course_id: "081", chapter_id: ch, type: "单选题", difficulty: 2 + (idx % 3), title: strip(item.title || ""), options: { A: strip(item.optionA || ""), B: strip(item.optionB || ""), C: strip(item.optionC || ""), D: strip(item.optionD || "") }, correct: String(item.correctAns || "").trim().toUpperCase(), explanation: strip(item.explanationTotal || "") || "暂无解析", img: item["title-img"] ? `/api/quiz/figures/${item["title-img"]}` : "", ans_img: item["ans-img"] ? `/api/quiz/figures/${item["ans-img"]}` : "" };
    }).filter((q: any) => q.title && Object.keys(q.options).length >= 2 && q.correct);
    if (chapter_ids?.length) pool = pool.filter((q: any) => chapter_ids.includes(q.chapter_id));
    if (mode === "challenge") pool.sort((a: any, b: any) => b.difficulty - a.difficulty);
    const n = Math.max(1, Math.min(count || 20, pool.length));
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

  // Materials
  if (p === "materials/list") return res.json(listMats().map((m: any) => { const { path: _p, ...rest } = m; return rest; }));

  // Forum
  if (p === "forum/posts") {
    return res.json({ id: "99", title: body.title || "", author: "匿名用户", role: "student", time: "刚刚", content: body.content || "", excerpt: (body.content || "").slice(0, 150), replyCount: 0, viewCount: 1, upvoteCount: 0, status: "open", hot: false, hasAiAnswer: false, tags: [], bookmarked: false });
  }

  return res.status(404).json({});
}

async function aiChat(message: string): Promise<string> {
  try {
    const key = process.env.DEEPSEEK_API_KEY || "";
    if (!key) { const q = message.toLowerCase(); if (q.includes("升力")) return "## 升力公式\n$$L = \\frac12\\rho V^2 S C_L$$"; if (q.includes("失速")) return "## 失速\n超临界攻角后气流分离。改出：推杆减攻角→保水平→加油门。"; return "配置 `DEEPSEEK_API_KEY` 环境变量可启用 AI 大模型。"; }
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: key, baseURL: "https://api.deepseek.com" });
    const r = await client.chat.completions.create({ model: "deepseek-chat", messages: [{ role: "user", content: message }] as any, temperature: 0.7, max_tokens: 2000 });
    return r.choices[0]?.message?.content || "";
  } catch { return "AI 暂不可用。"; }
}
