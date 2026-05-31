# -*- coding: utf-8 -*-
"""小飞 AI 伴学平台 — Streamlit Cloud 公网版"""
import streamlit as st
import json, random, re, os, html
from datetime import datetime, date
from pathlib import Path

st.set_page_config(page_title="小飞 · 飞行学员智能助手", page_icon="✈️", layout="wide")

# ═══════════════════════════════════════════════
# 样式
# ═══════════════════════════════════════════════
st.markdown("""
<style>
footer, #MainMenu { visibility: hidden; }
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0a1530 0%, #070f24 100%);
}
[data-testid="stSidebar"] .stMarkdown, [data-testid="stSidebar"] .stText, [data-testid="stSidebar"] label {
    color: #e2e8f0 !important;
}
[data-testid="stSidebar"] button { color: #e2e8f0 !important; }
.ch-item {
    background: white; border-radius: 12px; padding: 14px 18px; margin-bottom: 10px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06); border-left: 3px solid #5645d4;
}
.card {
    background: white; border-radius: 16px; padding: 28px 20px; text-align: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08); cursor: pointer; border: 2px solid transparent;
}
.progress-wrap { background: #e2e8f0; border-radius: 4px; height: 6px; overflow: hidden; margin: 8px 0; }
.progress-fill { height: 100%; background: linear-gradient(90deg,#5645d4,#7b3ff2); border-radius: 4px; }
</style>
""", unsafe_allow_html=True)

# ═══════════════════════════════════════════════
# 数据路径
# ═══════════════════════════════════════════════
BASE = Path(__file__).parent
QUIZ_JSON = BASE / "data" / "quiz" / "081_modify_Wang.json"
COURSE_DIR = BASE / "data" / "courseware" / "飞行原理"


def strip_html(text):
    if not text: return ""
    text = re.sub(r'<[^>]+>', '', str(text))
    text = text.replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>')
    text = text.replace('&#39;', "'").replace('&quot;', '"').replace('\\n', '\n')
    return text.strip()


@st.cache_data(ttl=3600)
def load_quiz():
    if not QUIZ_JSON.exists():
        return []
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


def chapter_from_tags(tags):
    m = re.search(r"081-\d{2}", str(tags))
    return m.group(0) if m else "081-01"


# ═══════════════════════════════════════════════
# Session State
# ═══════════════════════════════════════════════
if "page" not in st.session_state:
    st.session_state.page = "ai"

if "ai_messages" not in st.session_state:
    st.session_state.ai_messages = []

if "quiz_qs" not in st.session_state:
    st.session_state.quiz_qs = []
if "quiz_idx" not in st.session_state:
    st.session_state.quiz_idx = 0
if "quiz_ans" not in st.session_state:
    st.session_state.quiz_ans = {}
if "quiz_sub" not in st.session_state:
    st.session_state.quiz_sub = False
if "quiz_score" not in st.session_state:
    st.session_state.quiz_score = 0

if "forum_posts" not in st.session_state:
    st.session_state.forum_posts = [
        {"id": 1, "title": "临界攻角和失速速度到底谁决定谁？", "author": "航宇小明", "role": "student",
         "time": "05-30 09:20", "content": "复习 2-6 时发现很多题把速度、重量、构型和攻角混在一起考，想请教如何建立判断顺序。", "replies": 5, "views": 142, "chapter": "081-03", "tags": ["失速", "临界攻角"]},
        {"id": 2, "title": "重心前移为什么会增加杆力梯度？", "author": "王老师", "role": "teacher",
         "time": "05-29 18:40", "content": "题库里多次出现 CG forward 与 stick force per g 的关系，求一个直观解释。", "replies": 8, "views": 296, "chapter": "081-04", "tags": ["稳定性", "重心"]},
        {"id": 3, "title": "伯努利方程中静压和动压的物理意义？", "author": "飞行新手", "role": "student",
         "time": "05-31 10:15", "content": "一直没搞明白 P 和 ½ρv² 分别代表什么。", "replies": 3, "views": 88, "chapter": "081-01", "tags": ["伯努利"]},
    ]
if "forum_replies" not in st.session_state:
    st.session_state.forum_replies = {
        1: [
            {"author": "王老师", "role": "teacher", "time": "05-30 10:15", "content": "**失速的本质是攻角超过临界值**。速度、重量、构型改变的是'在什么速度下会达到临界攻角'。\n\n做题框架：\n1. 先判断临界攻角是否被触及\n2. 再确定题目问什么\n3. 用 Vs=√(2W/ρSCLmax) 判断"},
            {"author": "航宇达人", "role": "student", "time": "05-30 11:30", "content": "转弯时载荷因数 n>1，失速速度乘以 √n。盘旋更容易失速是因为需要更大的 CL 维持 L=nW。"},
        ],
        2: [
            {"author": "王老师", "role": "teacher", "time": "05-29 19:00", "content": "重心前移→静稳定裕度增大→需要更大的升降舵偏转→杆力增大。飞机更'稳'了，但更'不愿意'改变姿态。"},
        ],
    }

# ═══════════════════════════════════════════════
# AI 调用
# ═══════════════════════════════════════════════
SYSTEM_PROMPT = """你是"小飞"，北京航空航天大学飞行技术专业的AI学习助手。

## 身份与能力
- 知识渊博、耐心细致的航空教育导师
- 准确讲解飞行原理、航空气象、空中导航等
- 针对计算题给出思路引导，不直接给答案

## 输出规范
- 结构清晰，使用 Markdown 组织内容
- 数学公式使用 LaTeX：行内 $...$，独立 $$...$$
- 使用表格、分步骤讲解
- 不寒暄开头结尾，信息密度高
- 不回答与飞行无关的问题"""


def call_deepseek(messages):
    try:
        from openai import OpenAI
        api_key = st.secrets.get("DEEPSEEK_API_KEY", os.environ.get("DEEPSEEK_API_KEY", ""))
        if not api_key:
            return _local_answer(messages[-1]["content"])
        client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
        resp = client.chat.completions.create(
            model="deepseek-chat", messages=messages,
            temperature=0.7, max_tokens=2000)
        return resp.choices[0].message.content
    except Exception as e:
        return _local_answer(messages[-1]["content"])


def _local_answer(q):
    ql = q.lower()
    if any(k in ql for k in ["升力", "lift"]):
        return """## 升力公式\n\n$L = \\frac{1}{2}\\rho V^2 S C_L$\n\n| 符号 | 含义 | 单位 |\n|------|------|------|\n| $\\rho$ | 空气密度 | kg/m³ |\n| $V$ | 真空速 | m/s |\n| $S$ | 机翼面积 | m² |\n| $C_L$ | 升力系数 | 无量纲 |\n\n升力与速度的平方成正比。平飞时 $L \\approx W$。"""
    if any(k in ql for k in ["失速", "stall"]):
        return """## 失速原理\n\n**失速**：超临界攻角后气流分离，升力急剧下降。\n\n改出方法：\n1. 向前推杆减小攻角\n2. 保持机翼水平\n3. 适当加油门\n\n> 失速的本质是攻角超标，而非速度过低！"""
    if any(k in ql for k in ["襟翼", "flap"]):
        return """## 襟翼作用\n\n- 增加 CLmax（增大机翼弯度）\n- 增加阻力（帮助减速）\n\n| 阶段 | 角度 | 目的 |\n|------|------|------|\n| 起飞 | 5°-15° | 增升力，缩距离 |\n| 着陆 | 30°-40° | 增升力+阻力 |"""
    return f"关于「{q[:50]}」，请尝试具体描述你的问题。如需 AI 大模型回答，请在 Streamlit Cloud → Settings → Secrets 添加 `DEEPSEEK_API_KEY`。"

# ═══════════════════════════════════════════════
# 侧边栏
# ═══════════════════════════════════════════════
with st.sidebar:
    st.markdown("### ✈️ 小飞 · 飞行原理")
    st.markdown("飞行学员 AI 伴学平台")
    st.markdown("---")

    pages = [
        ("🤖", "AI导师", "ai"),
        ("📝", "题库练习", "quiz"),
        ("📚", "课程资料", "materials"),
        ("💬", "讨论社区", "forum"),
    ]
    for icon, label, name in pages:
        if st.button(f"{icon}  {label}", use_container_width=True, key=f"nav_{name}"):
            st.session_state.page = name
            st.rerun()

    st.markdown("---")
    st.markdown("<div style='font-size:11px;color:#94a3b8;text-align:center'>飞行原理 081<br>北京航空航天大学<br>Powered by Streamlit</div>", unsafe_allow_html=True)

# ═══════════════════════════════════════════════
# AI 导师页
# ═══════════════════════════════════════════════
def page_ai():
    st.markdown("# 🤖 小飞 · AI导师")
    st.markdown("飞行学员的24小时智能学习助手")
    st.markdown("---")

    QUICK_QS = [
        "升力公式详解", "伯努利原理在飞行中的应用",
        "失速的识别与改出", "襟翼的作用和使用场景",
        "飞机三种操纵方式原理", "静稳定性与动稳定性区别",
        "临界攻角与失速速度的关系", "爬升性能与哪些因素有关",
    ]

    with st.expander("💡 快捷问题"):
        cols = st.columns(4)
        for i, q in enumerate(QUICK_QS):
            with cols[i % 4]:
                if st.button(q, key=f"quick_{i}", use_container_width=True):
                    st.session_state.ai_messages.append({"role": "user", "content": q})
                    st.session_state.ai_messages.append({"role": "assistant", "content": call_deepseek([{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": q}])})
                    st.rerun()

    for msg in st.session_state.ai_messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if prompt := st.chat_input("输入你的问题..."):
        st.session_state.ai_messages.append({"role": "user", "content": prompt})
        history = [{"role": "system", "content": SYSTEM_PROMPT}] + st.session_state.ai_messages[:-1]
        st.session_state.ai_messages.append({"role": "assistant", "content": call_deepseek(history)})
        st.rerun()

    if st.button("🗑️ 清空对话"):
        st.session_state.ai_messages = []
        st.rerun()

# ═══════════════════════════════════════════════
# 题库练习页
# ═══════════════════════════════════════════════
def page_quiz():
    if st.session_state.quiz_qs:
        _quiz_session()
        return
    _quiz_menu()

def _quiz_menu():
    st.markdown("# 📝 题库练习")
    st.markdown("---")
    all_data = load_quiz()
    if not all_data:
        st.warning("题库数据未加载")
        return

    tab1, tab2, tab3 = st.tabs(["📖 章节练习", "🎲 随机组卷", "⚔️ 闯关模式"])

    with tab1:
        st.markdown("### 选择章节（可多选）")
        selected = []
        cols = st.columns(2)
        for i, ch in enumerate(CHAPTERS):
            with cols[i % 2]:
                qs = [q for q in all_data if chapter_from_tags(q.get("tags", "")) == ch["id"]]
                if st.checkbox(f"{ch['id']} {ch['name']}（{len(qs)}题）", key=f"ch_{ch['id']}"):
                    selected.append(ch["id"])
        if st.button("▶ 开始章节练习", type="primary", use_container_width=True):
            if selected:
                pool = [q for q in all_data if chapter_from_tags(q.get("tags", "")) in selected]
                st.session_state.quiz_qs = random.sample(pool, min(len(pool), 9999))
                st.session_state.quiz_idx = 0
                st.session_state.quiz_ans = {}
                st.session_state.quiz_sub = False
                st.session_state.quiz_score = 0
                st.rerun()

    with tab2:
        st.markdown("### 随机组卷")
        n = st.slider("题目数量", 10, 50, 30)
        if st.button("▶ 开始随机练习", type="primary", use_container_width=True):
            pool = random.sample(all_data, min(n, len(all_data)))
            st.session_state.quiz_qs = pool
            st.session_state.quiz_idx = 0
            st.session_state.quiz_ans = {}
            st.session_state.quiz_sub = False
            st.session_state.quiz_score = 0
            st.rerun()

    with tab3:
        st.markdown("### 闯关模式")
        st.warning("⚔️ 答错即失败！")
        if st.button("⚔️ 开始闯关", type="primary", use_container_width=True):
            shuffled = all_data[:]
            random.shuffle(shuffled)
            st.session_state.quiz_qs = shuffled
            st.session_state.quiz_idx = 0
            st.session_state.quiz_ans = {}
            st.session_state.quiz_sub = False
            st.session_state.quiz_score = 0
            st.rerun()

def _quiz_session():
    qs = st.session_state.quiz_qs
    idx = st.session_state.quiz_idx
    if idx >= len(qs):
        st.success(f"🎉 完成！得分 {st.session_state.quiz_score}/{len(qs)}")
        if st.button("返回题库"):
            st.session_state.quiz_qs = []
            st.rerun()
        return

    q = qs[idx]
    correct_ans = str(q.get("correctAns", "")).strip().upper()
    user_ans = st.session_state.quiz_ans.get(idx, "")
    submitted = st.session_state.quiz_sub

    col1, col2, col3 = st.columns([1, 3, 1])
    with col1:
        if st.button("← 返回"):
            st.session_state.quiz_qs = []
            st.rerun()
    with col2:
        prog = (idx + 1) / len(qs)
        st.markdown(f"**第 {idx+1}/{len(qs)} 题** · 得分 {st.session_state.quiz_score}")
        st.markdown(f'<div class="progress-wrap"><div class="progress-fill" style="width:{prog*100}%"></div></div>', unsafe_allow_html=True)

    st.markdown("---")
    st.markdown(f"#### {strip_html(q.get('title', ''))}")

    for opt_letter in ["A", "B", "C", "D"]:
        opt_text = strip_html(q.get(f"option{opt_letter}", ""))
        if not opt_text: continue
        is_correct = opt_letter == correct_ans
        is_selected = user_ans == opt_letter

        if submitted:
            label = f"{'✅' if is_correct else '❌' if is_selected else ''} **{opt_letter}.** {opt_text}"
        else:
            label = f"**{opt_letter}.** {opt_text}"

        if st.button(label, key=f"opt_{idx}_{opt_letter}", use_container_width=True):
            if not submitted:
                st.session_state.quiz_ans[idx] = opt_letter
                st.rerun()
        st.markdown("")

    c1, c2, c3 = st.columns(3)
    with c1:
        if not submitted:
            if st.button("✅ 提交答案", type="primary", use_container_width=True):
                st.session_state.quiz_sub = True
                if user_ans == correct_ans:
                    st.session_state.quiz_score += 1
                st.rerun()
        else:
            if st.button("下一题 ▶", type="primary", use_container_width=True):
                st.session_state.quiz_idx += 1
                st.session_state.quiz_sub = False
                st.rerun()
    with c2:
        if idx > 0 and st.button("◀ 上一题", use_container_width=True):
            st.session_state.quiz_idx -= 1
            st.session_state.quiz_sub = False
            st.rerun()

    if submitted:
        exp = strip_html(q.get("explanationTotal", ""))
        if exp:
            with st.expander("📖 解析"):
                st.markdown(exp)

# ═══════════════════════════════════════════════
# 课程资料页
# ═══════════════════════════════════════════════
def page_materials():
    st.markdown("# 📚 课程资料")
    st.markdown("---")

    materials = [
        {"chapter": "第一章 飞机与大气", "items": [
            ("飞机基本知识介绍", "1-1飞机基本知识介绍2025-2班.pdf"),
            ("大气环境基本知识", "1-2大气环境基本知识2025.pdf"),
        ]},
        {"chapter": "第二章 空气动力学基础", "items": [
            ("空气流动描述及流动规律", "2-1 空气流动描述及流动规律.pdf"),
            ("二维翼型升力特性", "2-2 二维翼型升力特性  -  已修复.pdf"),
            ("二维翼型阻力特性", "2-3 二维翼型阻力特性.pdf"),
            ("三维机翼与全机低速空气动力", "2-4 三维机翼与全机低速空气动力.pdf"),
            ("地面效应及尾流", "2-5 地面效应及尾流.pdf"),
            ("失速特性及失速告警", "2-6 失速特性及失速告警.pdf"),
            ("失速识别改出与失速尾旋", "2-7 失速识别改出与失速尾旋.pdf"),
        ]},
        {"chapter": "第三章 高速空气动力学", "items": [
            ("高速空气动力学基础 I", "3-1 高速空气动力学基础I.pdf"),
            ("高速空气动力学基础 II", "3-2 高速空气动力学基础II.pdf"),
        ]},
        {"chapter": "第四章 螺旋桨空气动力学", "items": [
            ("螺旋桨空气动力学基础", "4-1 螺旋桨空气动力学基础.pdf"),
            ("螺旋桨附加效应", "4-2 螺旋桨附加效应.pdf"),
        ]},
        {"chapter": "第五章 稳定性与操纵性", "items": [
            ("飞机的平衡及稳定性概念", "5-1 飞机的平衡及稳定性概念.pdf"),
            ("飞机的纵向静稳定性及操纵性", "5-2 飞机的纵向静稳定性及操纵性.pdf"),
            ("飞机的横航向静稳定性", "5-3 飞机的横航向静稳定性.pdf"),
            ("飞机的横航向动稳定性及操纵性", "5-4 飞机的横航向动稳定性及操纵性.pdf"),
        ]},
        {"chapter": "第六章 飞行性能", "items": [
            ("飞机的平飞性能与操纵", "6-1 飞机的平飞性能与操纵.pdf"),
            ("飞机的爬升与下降", "6-2 飞机的爬升与下降.pdf"),
            ("飞机的转弯与盘旋", "6-3飞机的转弯与盘旋1.pdf"),
            ("飞机的起飞与着陆", "6-4 飞机的起飞与着陆.pdf"),
            ("风场下的飞行操纵", "6-5 风场下的飞行操纵.pdf"),
        ]},
        {"chapter": "第七章 特殊飞行条件", "items": [
            ("单发失效和最小操纵速度", "7-1 单发失效和最小操纵速度.pdf"),
            ("飞行极限", "7-2 飞行极限.pdf"),
            ("突风响应与气动弹性", "7-3 突风响应与气动弹性.pdf"),
            ("机体污染与结冰条件下的飞行", "7-4 机体污染与结冰条件下的飞行.pdf"),
        ]},
        {"chapter": "补充读物", "items": [
            ("Oxford-Principles of Flight", "Oxford-Principles of Flight.pdf"),
        ]},
    ]

    for ch_data in materials:
        st.markdown(f"#### {ch_data['chapter']}")
        for title, filename in ch_data["items"]:
            col1, col2 = st.columns([4, 1])
            with col1:
                st.markdown(f"**{title}**")
            with col2:
                fpath = COURSE_DIR / filename
                if fpath.exists():
                    with open(fpath, "rb") as f:
                        st.download_button("⬇️ 下载", f, file_name=filename, mime="application/pdf", key=f"dl_{filename[:20]}")
                else:
                    st.caption("未找到")
            st.divider()

# ═══════════════════════════════════════════════
# 讨论社区页
# ═══════════════════════════════════════════════
def page_forum():
    st.markdown("# 💬 讨论社区")
    st.markdown("飞行员自由讨论空间，关于飞行的一切")
    st.markdown("---")

    with st.expander("✏️ 发布新帖"):
        title = st.text_input("标题")
        content = st.text_area("内容", height=100)
        author = st.text_input("昵称", value="匿名用户")
        if st.button("发布", type="primary"):
            if title and content:
                new_id = max([p["id"] for p in st.session_state.forum_posts], default=0) + 1
                st.session_state.forum_posts.insert(0, {
                    "id": new_id, "title": title, "content": content,
                    "author": author, "role": "student",
                    "time": datetime.now().strftime("%m-%d %H:%M"),
                    "replies": 0, "views": 1, "chapter": "", "tags": [],
                })
                st.success("发布成功！")
                st.rerun()

    for post in st.session_state.forum_posts:
        role_badge = "👨‍🏫 教师" if post["role"] == "teacher" else "👨‍🎓"
        with st.container():
            st.markdown(f"### {post['title']}")
            st.caption(f"{role_badge} · {post['author']} · {post['time']} · 👁 {post['views']} · 💬 {post['replies']}")
            st.markdown(post["content"][:200] + ("..." if len(post["content"]) > 200 else ""))

            view_key = f"view_{post['id']}"
            if st.button("查看详情", key=f"btn_{post['id']}"):
                st.session_state[view_key] = not st.session_state.get(view_key, False)
                st.rerun()

            if st.session_state.get(view_key):
                replies = st.session_state.forum_replies.get(post["id"], [])
                for r in replies:
                    r_badge = "👨‍🏫 教师" if r["role"] == "teacher" else "👨‍🎓"
                    st.markdown(f"""
                    <div style="background:#f8fafc;border-radius:8px;padding:10px;margin:6px 0;border-left:3px solid #5645d4">
                    <strong>{r['author']}</strong> {r_badge} · {r['time']}<br>{r['content']}
                    </div>""", unsafe_allow_html=True)

                r_content = st.text_area("写回复", key=f"rc_{post['id']}", height=60)
                if st.button("发送回复", key=f"sr_{post['id']}"):
                    if r_content:
                        if post["id"] not in st.session_state.forum_replies:
                            st.session_state.forum_replies[post["id"]] = []
                        st.session_state.forum_replies[post["id"]].append({
                            "author": "匿名用户", "role": "student",
                            "time": datetime.now().strftime("%m-%d %H:%M"), "content": r_content})
                        post["replies"] = post.get("replies", 0) + 1
                        st.rerun()
            st.markdown("---")

# ═══════════════════════════════════════════════
# 路由
# ═══════════════════════════════════════════════
p = st.session_state.page
if p == "ai":
    page_ai()
elif p == "quiz":
    page_quiz()
elif p == "materials":
    page_materials()
elif p == "forum":
    page_forum()
