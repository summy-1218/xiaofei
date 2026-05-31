# 小飞 AI 伴学平台 Demo

面向《飞行原理》课程的 AI 伴学平台 demo，已接入 `data` 目录中的课件、知识点和题库资产。

## 环境要求

| 组件 | 要求 | 说明 |
|------|------|------|
| Python | **3.10+**（推荐 3.12） | 代码使用了 `X \| None` 联合类型语法 |
| Node.js | **18+** | Next.js 15.3+ 支持 Node 24 |
| 磁盘 | ~500 MB | 含 26 个课件 PDF + 1631 题题库 JSON |

## 已实现

- **AI 导师**：首页对话、快捷提问、最近对话、学习建议。无 API Key 时使用本地知识兜底。
- **本地知识兜底**：后端基于飞行原理知识点、题库解析和课件名称生成可演示回答，支持 Markdown + LaTeX 公式。
- **题库练习**：读取 `081_modify_Wang.json`（1631 题），支持章节练习、随机组卷、闯关模式、提交判题和解析展示。
- **课程资料**：读取 `data/courseware/飞行原理` 下 26 个 PDF，支持筛选、搜索、在线浏览和下载。
- **学情追踪**：统计卡片、章节掌握度、薄弱点建议。
- **讨论社区**：轻量发帖和示例讨论列表。

## 验证状态（2026-05-30）

| API 端点 | 状态 | 说明 |
|---------|------|------|
| `GET /api/health` | 通过 | 返回 `{"status":"ok"}` |
| `GET /api/quiz/chapters` | 通过 | 8 章节，含题目数统计 |
| `POST /api/quiz/practice` | 通过 | 随机/章节/闯关抽题 |
| `POST /api/quiz/submit` | 通过 | 判题并返回解析 |
| `POST /api/chat/send` | 通过 | 本地知识库生成 Markdown 回答 |
| `POST /api/materials/list` | 通过 | 返回 26 个课件元数据 |
| `GET /api/materials/download/{id}` | 通过 | PDF 文件流下载 |
| `GET /api/forum/posts` | 通过 | 2 条示例帖子 |
| `GET /api/analytics/overview` | 通过 | 模拟统计数据 |

## 运行

### 方式一：完整版（Next.js + FastAPI）

**后端**（需要 Python 3.10+）：

```powershell
cd backend
pip install -r requirements.txt
# 以下为最小依赖（如 requirements.txt 安装慢）
pip install fastapi uvicorn pydantic pydantic-settings python-jose passlib bcrypt httpx
"C:\Users\Think\anaconda3\python.exe" -m uvicorn app.main:app --app-dir "f:/12-教学相关/小飞/backend" --reload
```

**前端**（需要 Node 18/20，⚠️ Node 24 不支持）：

```powershell
cd frontend
npm install
npm run dev
```

访问 `http://localhost:3000`。

---

## 公网部署

### 方案一：ngrok（最快，5分钟，无需 GitHub）

```powershell
# 1. 从 https://ngrok.com/download 下载 ngrok.exe
# 2. Streamlit 已在 8501 端口运行，新开终端：
ngrok http 8501
```

获得公网地址 `https://xxxx.ngrok-free.app`，直接分享即可。

### 方案二：Streamlit Community Cloud（免费，需 GitHub）

1. 将 `deploy/` 目录下的文件 + `data/` 目录推送到 GitHub：

```
仓库根目录/
├── app.py              ← 从 deploy/app.py 复制到根目录
├── requirements.txt    ← 从 deploy/requirements.txt 复制到根目录
├── data/
│   ├── quiz/
│   │   └── 081_modify_Wang.json   ← 精简版题库（从完整题库复制）
│   └── courseware/
│       └── 飞行原理/
│           └── *.pdf              ← 26 个课件 PDF
```

2. 访问 https://streamlit.io/cloud → Sign in with GitHub
3. New app → 选择仓库 → 部署
4. 如需配置 OpenAI Key，在 Settings → Secrets 中添加 `OPENAI_API_KEY`

> **注意**：GitHub 有 100MB 单文件限制。26 个 PDF 约 135MB，个别文件可能超限。如遇问题可使用方案三。

### 方案三：自建服务器 / VPS

部署 Next.js 生产构建 + FastAPI 后端，配合 nginx 反向代理。

## 数据来源

- 课件：`data/courseware/飞行原理/*.pdf`（26 个 PDF）
- 题库：`data/quiz/081_modify_Wang.json`（1631 题）
- 知识点：`backend/app/services/course_data.py` 中整理了 5 个核心知识点（升力公式、失速、伯努利、稳定性、单发失效），并结合 1200 道题库解析做关键词检索。

## 项目结构

```
小飞/
├── frontend/          ← Next.js 前端（需要 Node 18/20）
│   └── src/app/       ← 5 个页面：AI导师(首页)/题库/资料/学情/社区
├── backend/           ← FastAPI 后端（Python 3.10+）
│   └── app/
│       ├── api/       ← 6 个路由模块
│       ├── core/      ← LLM/RAG/知识图谱/推荐
│       └── services/  ← 本地数据服务（course_data.py 为核心）
├── data/              ← 课件 PDF + 题库 JSON
├── docs/              ← 参考文档
└── template/          ← DESIGN.md 设计系统
```

## 后续可扩展

- 用 `backend/scripts` 增加 PDF 文本抽取和向量化脚本，接入 ChromaDB。
- 将当前本地 demo 数据服务替换为 PostgreSQL/Neo4j 持久化服务。
- 将 AI 导师从本地兜底回答升级为 LLM + RAG 引用回答。
- 配置 `OPENAI_API_KEY` 环境变量即可启用真实 LLM 回答。
