# -*- coding: utf-8 -*-
"""小飞 AI 伴学平台 — 公网版 · Notion 风格 UI"""
import streamlit as st
import json, random, re, os, html as _html
from datetime import datetime
from pathlib import Path

st.set_page_config(page_title="小飞 · 飞行学员智能助手", page_icon="✈️", layout="wide")

# ═══════════════════════════════════════════════
# Notion 风格 CSS — 尽最大努力还原本地版
# ═══════════════════════════════════════════════
st.markdown("""
<style>
/* ── 全局 ─────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
html, body, [class*="stApp"] {
    font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif !important;
    background: #fafaf9;
}
footer, #MainMenu, header[data-testid="stHeader"] { visibility: hidden !important; }

/* ── 侧边栏 ──────────────────────── */
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0a1530 0%, #070f24 100%) !important;
}
[data-testid="stSidebar"] * { color: #e2e8f0 !important; }
[data-testid="stSidebar"] button {
    border-radius: 8px !important; text-align: left !important;
    padding: 10px 14px !important; font-size: 14px !important;
    font-weight: 400 !important; border: none !important;
    transition: background .15s !important;
}
[data-testid="stSidebar"] button:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
[data-testid="stSidebar"] button[kind] { background: rgba(255,255,255,0.15) !important; font-weight: 500 !important; }

/* ── 主内容 ──────────────────────── */
.main .block-container { max-width: 960px !important; padding-top: 2rem !important; }
h1 { font-size: 28px !important; font-weight: 700 !important; color: #1a1a1a !important; margin-bottom: 4px !important; }
h2 { font-size: 22px !important; font-weight: 600 !important; color: #1a1a1a !important; }
h3 { font-size: 18px !important; font-weight: 600 !important; color: #1a1a1a !important; }
p, li, label, div { color: #37352f; }

/* ── 按钮 ────────────────────────── */
.stButton > button {
    border-radius: 8px !important; font-weight: 500 !important;
    font-size: 14px !important; padding: 10px 18px !important;
    transition: all .15s !important; border: none !important;
}
.stButton > button[kind="primary"] { background: #5645d4 !important; color: #fff !important; }
.stButton > button[kind="primary"]:hover { background: #4534b3 !important; }
.stButton > button[kind="secondary"], .stButton > button:not([kind]) {
    background: transparent !important; color: #1a1a1a !important;
    border: 1px solid #c8c4be !important;
}
.stButton > button[kind="secondary"]:hover, .stButton > button:not([kind]):hover {
    background: #f6f5f4 !important;
}

/* ── 输入框 ──────────────────────── */
textarea, input[type="text"] {
    border-radius: 8px !important; border: 1px solid #c8c4be !important;
    font-size: 16px !important; padding: 12px 16px !important;
}
textarea:focus, input[type="text"]:focus {
    border-color: #5645d4 !important; box-shadow: 0 0 0 1px #5645d4 !important;
}

/* ── Tabs ────────────────────────── */
[data-testid="stTabs"] button {
    font-weight: 500 !important; font-size: 14px !important;
}

/* ── expander ────────────────────── */
[data-testid="stExpander"] details {
    border-radius: 10px !important; border: 1px solid #e5e3df !important;
}

/* ── 进度条 ──────────────────────── */
.progress-bar { background: #e2e8f0; border-radius: 4px; height: 6px; overflow: hidden; margin: 8px 0; }
.progress-fill { height: 100%; background: linear-gradient(90deg,#5645d4,#7b3ff2); border-radius: 4px; transition: width .3s; }

/* ── 回复卡片 ────────────────────── */
.reply-card {
    background: #f8fafc; border-radius: 8px; padding: 10px; margin: 6px 0;
    border-left: 3px solid #5645d4;
}
</style>
""", unsafe_allow_html=True)

# ═══════════════════════════════════════════════
# 数据
# ═══════════════════════════════════════════════
BASE = Path(__file__).parent
QUIZ_JSON = BASE / "data" / "quiz" / "081_modify_Wang.json"
COURSE_DIR = BASE / "data" / "courseware" / "飞行原理"


def strip_html(text):
    if not text: return ""
    text = re.sub(r'<br\s*/?>', '\n', str(text), flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    text = _html.unescape(text)
    return re.sub(r'\s+', ' ', text).strip()


@st.cache_data(ttl=3600)
def load_quiz():
    if not QUIZ_JSON.exists(): return []
    with open(QUIZ_JSON, encoding='utf-8') as f:
        return json.load(f)


CHAPTERS = [
    {"id": "081-01", "name": "亚音速空气动力学", "en": "Subsonic Aerodynamics"},
    {"id": "081-02", "name": "螺旋桨", "en": "Propellers"},
    {"id": "081-03", "name": "失速/马赫下坠", "en": "Stall & Mach Tuck"},
    {"id": "081-04", "name": "稳定性", "en": "Stability"},
    {"id": "081-05", "name": "操控", "en": "Control"},
    {"id": "081-06", "name": "限制", "en": "Limitations"},
    {"id": "081-07", "name": "性能", "en": "Performance"},
    {"id": "081-08", "name": "飞行力学", "en": "Flight Mechanics"},
]


def ch_from_tags(tags):
    m = re.search(r"081-\d{2}", str(tags))
    return m.group(0) if m else "081-01"


# ═══════════════════════════════════════════════
# Session
# ═══════════════════════════════════════════════
if "page" not in st.session_state: st.session_state.page = "ai"
if "ai_msgs" not in st.session_state: st.session_state.ai_msgs = []
if "qz_qs" not in st.session_state: st.session_state.qz_qs = []
if "qz_i" not in st.session_state: st.session_state.qz_i = 0
if "qz_a" not in st.session_state: st.session_state.qz_a = {}
if "qz_s" not in st.session_state: st.session_state.qz_s = False
if "qz_sc" not in st.session_state: st.session_state.qz_sc = 0
if "posts" not in st.session_state:
    st.session_state.posts = [
        {"id": 1, "title": "临界攻角和失速速度到底谁决定谁？", "author": "航宇小明", "role": "student",
         "time": "05-30 09:20", "content": "复习 2-6 时发现很多题把速度、重量、构型和攻角混在一起考，想请教如何建立判断顺序。", "replies": 5, "views": 142},
        {"id": 2, "title": "重心前移为什么会增加杆力梯度？", "author": "王老师", "role": "teacher",
         "time": "05-29 18:40", "content": "题库里多次出现 CG forward 与 stick force per g 的关系，求直观解释。", "replies": 8, "views": 296},
        {"id": 3, "title": "伯努利方程中静压和动压的物理意义？", "author": "飞行新手", "role": "student",
         "time": "05-31 10:15", "content": "一直没搞明白 P 和 ½ρv² 分别代表什么。", "replies": 3, "views": 88},
    ]
if "replies" not in st.session_state:
    st.session_state.replies = {
        1: [{"author": "王老师", "role": "teacher", "time": "05-30 10:15",
             "content": "**失速的本质是攻角超过临界值**。做题框架：\n1. 先判断临界攻角是否被触及\n2. 用 Vs=√(2W/ρSCLmax) 判断各因素对失速速度的影响"},
            {"author": "航宇达人", "role": "student", "time": "05-30 11:30",
             "content": "转弯时载荷因数 n>1，失速速度乘以 √n。盘旋更容易失速是因为需更大 CL 维持 L=nW。"}],
        2: [{"author": "王老师", "role": "teacher", "time": "05-29 19:00",
             "content": "重心前移→静稳定裕度增大→需要更大的升降舵偏转→杆力增大。飞机更「稳」了，但更不愿改变姿态。"}],
    }

# ═══════════════════════════════════════════════
# AI
# ═══════════════════════════════════════════════
SYS = """你是"小飞"，北京航空航天大学飞行技术专业的AI学习助手。
知识渊博、耐心细致，准确讲解航空理论知识。
- 对计算题给出思路引导，不直接给答案
- 使用 Markdown + LaTeX 组织内容
- 不寒暄开头结尾，信息密度高"""


def call_ai(messages):
    try:
        from openai import OpenAI
        key = st.secrets.get("DEEPSEEK_API_KEY", os.environ.get("DEEPSEEK_API_KEY", ""))
        if not key: return local_answer(messages[-1]["content"])
        client = OpenAI(api_key=key, base_url="https://api.deepseek.com")
        return client.chat.completions.create(
            model="deepseek-chat", messages=messages, temperature=0.7, max_tokens=2000
        ).choices[0].message.content
    except:
        return local_answer(messages[-1]["content"])


def local_answer(q):
    ql = q.lower()
    if any(k in ql for k in ["升力", "lift"]):
        return "## 升力公式\n\n$$L = \\frac{1}{2}\\rho V^2 S C_L$$\n\n| 符号 | 含义 | 单位 |\n|------|------|------|\n| $\\rho$ | 空气密度 | kg/m³ |\n| $V$ | 真空速 | m/s |\n| $S$ | 机翼面积 | m² |\n| $C_L$ | 升力系数 | 无量纲 |\n\n升力与速度平方成正比。平飞时 $L \\approx W$，速度增大需减小攻角保持平衡。"
    if any(k in ql for k in ["失速", "stall"]):
        return "## 失速\n\n超临界攻角后气流分离，升力急剧下降。\n\n**改出**：①推杆减攻角 ②保水平 ③加油门\n\n> 失速本质是攻角超标，非速度过低。"
    if any(k in ql for k in ["襟翼", "flap"]):
        return "## 襟翼\n\n| 阶段 | 角度 | 目的 |\n|------|------|------|\n| 起飞 | 5°-15° | 增升力 |\n| 着陆 | 30°-40° | 增升力+阻力 |"
    if any(k in ql for k in ["稳定", "stability"]):
        return "## 稳定性\n\n- **静稳定性**：受扰后回原状态的趋势\n- **动稳定性**：随时间收敛还是发散\n\n| 轴 | 决定因素 |\n|------|---------|\n| 纵向 | 焦点 vs 重心 |\n| 横向 | 上反角 |\n| 航向 | 垂尾面积 |"
    return f"关于「{q[:60]}」，我暂时无法给出精确回答。\n\n如需 AI 大模型支持，请在 Streamlit Cloud → Settings → Secrets 添加 `DEEPSEEK_API_KEY`。"

# ═══════════════════════════════════════════════
# 侧边栏
# ═══════════════════════════════════════════════
with st.sidebar:
    st.markdown("### ✈️ 小飞")
    st.markdown("飞行学员 AI 伴学平台")
    st.markdown("---")
    for icon, label, name in [("🤖", "AI导师", "ai"), ("📝", "题库练习", "quiz"), ("📚", "课程资料", "materials"), ("💬", "讨论社区", "forum")]:
        if st.button(f"{icon}  {label}", use_container_width=True, key=f"n_{name}"):
            st.session_state.page = name; st.rerun()
    st.markdown("---")
    st.markdown("<div style='font-size:11px;color:#94a3b8;text-align:center'>飞行原理 081<br>北京航空航天大学<br><span style='color:#7b3ff2'>Powered by Streamlit</span></div>", unsafe_allow_html=True)

# ═══════════════════════════════════════════════
# AI 导师
# ═══════════════════════════════════════════════
def page_ai():
    st.markdown("## 🤖 小飞 · AI导师")
    st.caption("飞行学员的 24 小时智能学习助手")
    st.markdown("---")

    QUICK = ["升力公式详解", "伯努利原理在飞行中的应用", "失速的识别与改出", "襟翼的作用和使用场景",
             "飞机三种操纵方式原理", "静稳定性与动稳定性区别", "临界攻角与失速速度的关系", "爬升性能与哪些因素有关"]

    with st.expander("💡 快捷问题（点击直接提问）"):
        cols = st.columns(4)
        for i, q in enumerate(QUICK):
            with cols[i % 4]:
                if st.button(q, key=f"q_{i}", use_container_width=True):
                    st.session_state.ai_msgs.append({"role": "user", "content": q})
                    st.session_state.ai_msgs.append({"role": "assistant", "content": call_ai([{"role": "system", "content": SYS}, {"role": "user", "content": q}])})
                    st.rerun()

    for msg in st.session_state.ai_msgs:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if p := st.chat_input("输入你的问题..."):
        st.session_state.ai_msgs.append({"role": "user", "content": p})
        h = [{"role": "system", "content": SYS}] + st.session_state.ai_msgs[:-1]
        st.session_state.ai_msgs.append({"role": "assistant", "content": call_ai(h)})
        st.rerun()

    if st.button("🗑️ 清空对话", key="clr"):
        st.session_state.ai_msgs = []; st.rerun()

# ═══════════════════════════════════════════════
# 题库
# ═══════════════════════════════════════════════
def page_quiz():
    if st.session_state.qz_qs: _qz_sess(); return
    _qz_menu()

def _qz_menu():
    st.markdown("## 📝 题库练习")
    st.caption("已接入飞行原理本地题库（1631 题）")
    st.markdown("---")
    all_data = load_quiz()
    if not all_data: st.warning("题库数据未加载"); return

    t1, t2, t3 = st.tabs(["📖 章节练习", "🎲 随机组卷", "⚔️ 闯关模式"])

    with t1:
        st.markdown("**选择章节（可多选）**")
        sel = []
        cols = st.columns(2)
        for i, ch in enumerate(CHAPTERS):
            with cols[i % 2]:
                qs = [q for q in all_data if ch_from_tags(q.get("tags", "")) == ch["id"]]
                if st.checkbox(f"{ch['name']}（{len(qs)}题）", key=f"c_{ch['id']}"): sel.append(ch["id"])
        if st.button("▶ 开始章节练习", type="primary", use_container_width=True):
            if sel:
                pool = [q for q in all_data if ch_from_tags(q.get("tags", "")) in sel]
                st.session_state.qz_qs = random.sample(pool, min(len(pool), 9999))
                st.session_state.qz_i = st.session_state.qz_sc = 0
                st.session_state.qz_a = {}; st.session_state.qz_s = False
                st.rerun()

    with t2:
        st.markdown("**随机组卷**")
        n = st.slider("题目数量", 10, 50, 30, key="rn")
        if st.button("▶ 开始随机练习", type="primary", use_container_width=True):
            st.session_state.qz_qs = random.sample(all_data, min(n, len(all_data)))
            st.session_state.qz_i = st.session_state.qz_sc = 0
            st.session_state.qz_a = {}; st.session_state.qz_s = False
            st.rerun()

    with t3:
        st.markdown("**闯关模式**")
        st.warning("⚔️ 答错即失败！")
        if st.button("⚔️ 开始闯关", type="primary", use_container_width=True):
            s = all_data[:]; random.shuffle(s)
            st.session_state.qz_qs = s
            st.session_state.qz_i = st.session_state.qz_sc = 0
            st.session_state.qz_a = {}; st.session_state.qz_s = False
            st.rerun()

def _qz_sess():
    qs = st.session_state.qz_qs; i = st.session_state.qz_i
    if i >= len(qs):
        st.success(f"🎉 完成！得分 {st.session_state.qz_sc}/{len(qs)}")
        if st.button("返回题库"): st.session_state.qz_qs = []; st.rerun()
        return
    q = qs[i]; ca = str(q.get("correctAns", "")).strip().upper()
    ua = st.session_state.qz_a.get(i, ""); sub = st.session_state.qz_s

    c1, c2, c3 = st.columns([1, 4, 1])
    with c1:
        if st.button("← 返回", use_container_width=True): st.session_state.qz_qs = []; st.rerun()
    with c2:
        p = (i+1)/len(qs)
        st.markdown(f"**第 {i+1}/{len(qs)} 题** · 得分 {st.session_state.qz_sc}")
        st.markdown(f'<div class="progress-bar"><div class="progress-fill" style="width:{p*100}%"></div></div>', unsafe_allow_html=True)

    st.markdown(f"### {strip_html(q.get('title', ''))}")

    for L in ["A", "B", "C", "D"]:
        t = strip_html(q.get(f"option{L}", ""))
        if not t: continue
        is_c = L == ca; is_s = ua == L
        pre = "✅ " if sub and is_c else "❌ " if sub and is_s and not is_c else ""
        if st.button(f"{pre}**{L}.** {t}", key=f"o_{i}_{L}", use_container_width=True):
            if not sub: st.session_state.qz_a[i] = L; st.rerun()

    c1, c2, c3 = st.columns(3)
    with c1:
        if not sub:
            if st.button("✅ 提交", type="primary", use_container_width=True):
                st.session_state.qz_s = True
                if ua == ca: st.session_state.qz_sc += 1
                st.rerun()
        else:
            if st.button("下一题 ▶", type="primary", use_container_width=True):
                st.session_state.qz_i += 1; st.session_state.qz_s = False; st.rerun()
    with c2:
        if i > 0 and st.button("◀ 上一题", use_container_width=True):
            st.session_state.qz_i -= 1; st.session_state.qz_s = False; st.rerun()

    if sub:
        exp = strip_html(q.get("explanationTotal", ""))
        if exp:
            with st.expander("📖 查看解析"): st.markdown(exp)

# ═══════════════════════════════════════════════
# 资料
# ═══════════════════════════════════════════════
_mats = [
    ("第一章 飞机与大气", [("飞机基本知识介绍", "1-1飞机基本知识介绍2025-2班.pdf"), ("大气环境基本知识", "1-2大气环境基本知识2025.pdf")]),
    ("第二章 空气动力学基础", [
        ("空气流动描述及流动规律", "2-1 空气流动描述及流动规律.pdf"),
        ("二维翼型升力特性", "2-2 二维翼型升力特性  -  已修复.pdf"),
        ("二维翼型阻力特性", "2-3 二维翼型阻力特性.pdf"),
        ("三维机翼与全机低速空气动力", "2-4 三维机翼与全机低速空气动力.pdf"),
        ("地面效应及尾流", "2-5 地面效应及尾流.pdf"),
        ("失速特性及失速告警", "2-6 失速特性及失速告警.pdf"),
        ("失速识别改出与失速尾旋", "2-7 失速识别改出与失速尾旋.pdf"),
    ]),
    ("第三章 高速空气动力学", [("高速空气动力学基础 I", "3-1 高速空气动力学基础I.pdf"), ("高速空气动力学基础 II", "3-2 高速空气动力学基础II.pdf")]),
    ("第四章 螺旋桨空气动力学", [("螺旋桨空气动力学基础", "4-1 螺旋桨空气动力学基础.pdf"), ("螺旋桨附加效应", "4-2 螺旋桨附加效应.pdf")]),
    ("第五章 稳定性与操纵性", [
        ("飞机的平衡及稳定性概念", "5-1 飞机的平衡及稳定性概念.pdf"),
        ("飞机的纵向静稳定性及操纵性", "5-2 飞机的纵向静稳定性及操纵性.pdf"),
        ("飞机的横航向静稳定性", "5-3 飞机的横航向静稳定性.pdf"),
        ("飞机的横航向动稳定性及操纵性", "5-4 飞机的横航向动稳定性及操纵性.pdf"),
    ]),
    ("第六章 飞行性能", [
        ("飞机的平飞性能与操纵", "6-1 飞机的平飞性能与操纵.pdf"),
        ("飞机的爬升与下降", "6-2 飞机的爬升与下降.pdf"),
        ("飞机的转弯与盘旋", "6-3飞机的转弯与盘旋1.pdf"),
        ("飞机的起飞与着陆", "6-4 飞机的起飞与着陆.pdf"),
        ("风场下的飞行操纵", "6-5 风场下的飞行操纵.pdf"),
    ]),
    ("第七章 特殊飞行条件", [
        ("单发失效和最小操纵速度", "7-1 单发失效和最小操纵速度.pdf"),
        ("飞行极限", "7-2 飞行极限.pdf"),
        ("突风响应与气动弹性", "7-3 突风响应与气动弹性.pdf"),
        ("机体污染与结冰条件下的飞行", "7-4 机体污染与结冰条件下的飞行.pdf"),
    ]),
    ("补充读物", [("Oxford-Principles of Flight", "Oxford-Principles of Flight.pdf")]),
]

def page_materials():
    st.markdown("## 📚 课程资料")
    st.caption("飞行原理课程资料，支持下载使用")
    st.markdown("---")
    for ch, items in _mats:
        st.markdown(f"**{ch}**")
        for title, fn in items:
            c1, c2 = st.columns([4, 1])
            with c1: st.markdown(title)
            with c2:
                fpath = COURSE_DIR / fn
                if fpath.exists():
                    with open(fpath, "rb") as f:
                        st.download_button("⬇️ 下载", f, file_name=fn, mime="application/pdf", key=f"d_{fn[:30]}")
                else: st.caption("—")
            st.divider()

# ═══════════════════════════════════════════════
# 社区
# ═══════════════════════════════════════════════
def page_forum():
    st.markdown("## 💬 讨论社区")
    st.caption("飞行员自由讨论空间，关于飞行的一切")
    st.markdown("---")

    with st.expander("✏️ 发布新帖"):
        ti = st.text_input("标题", key="ft"); co = st.text_area("内容", height=100, key="fc")
        if st.button("发布", type="primary"):
            if ti and co:
                nid = max([p["id"] for p in st.session_state.posts], default=0) + 1
                st.session_state.posts.insert(0, {"id": nid, "title": ti, "content": co, "author": "匿名用户", "role": "student", "time": datetime.now().strftime("%m-%d %H:%M"), "replies": 0, "views": 1})
                st.success("发布成功！"); st.rerun()

    for p in st.session_state.posts:
        badge = "👨‍🏫 教师" if p["role"] == "teacher" else "👨‍🎓"
        st.markdown(f"### {p['title']}")
        st.caption(f"{badge} · {p['author']} · {p['time']} · 👁 {p['views']} · 💬 {p['replies']}")
        st.markdown(p["content"][:200] + ("..." if len(p["content"]) > 200 else ""))

        vk = f"v_{p['id']}"
        if st.button("查看详情", key=f"b_{p['id']}"):
            st.session_state[vk] = not st.session_state.get(vk, False); st.rerun()
        if st.session_state.get(vk):
            for r in st.session_state.replies.get(p["id"], []):
                rb = "👨‍🏫 教师" if r["role"] == "teacher" else "👨‍🎓"
                st.markdown(f'<div class="reply-card"><strong>{r["author"]}</strong> {rb} · {r["time"]}<br>{r["content"]}</div>', unsafe_allow_html=True)
            rc = st.text_area("回复", key=f"r_{p['id']}", height=60)
            if st.button("发送", key=f"s_{p['id']}"):
                if rc:
                    if p["id"] not in st.session_state.replies: st.session_state.replies[p["id"]] = []
                    st.session_state.replies[p["id"]].append({"author": "匿名用户", "role": "student", "time": datetime.now().strftime("%m-%d %H:%M"), "content": rc})
                    p["replies"] += 1; st.rerun()
        st.markdown("---")

# ═══════════════════════════════════════════════
# 路由
# ═══════════════════════════════════════════════
{"ai": page_ai, "quiz": page_quiz, "materials": page_materials, "forum": page_forum}[st.session_state.page]()
