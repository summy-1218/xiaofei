# -*- coding: utf-8 -*-
"""
小飞 · 飞行原理课程助手 — 公网部署版
路径已调整为 Streamlit Cloud 标准目录结构
"""
import streamlit as st
import json
import random
import datetime
import os
import re

st.set_page_config(
    page_title="小飞 · 飞行原理课程助手",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ══════════════════════════════════════════════════════
# 路径配置（Streamlit Cloud 安全路径）
# ══════════════════════════════════════════════════════
BASE_DIR = os.path.dirname(__file__)
QUIZ_PATH = os.path.join(BASE_DIR, "data", "quiz", "081_modify_Wang.json")
COURSE_DIR = os.path.join(BASE_DIR, "data", "courseware", "飞行原理")


# ══════════════════════════════════════════════════════
# 全局样式
# ══════════════════════════════════════════════════════
st.markdown("""
<style>
footer { visibility: hidden; }
#MainMenu { visibility: hidden; }

[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0a1530 0%, #070f24 100%);
}
[data-testid="stSidebar"] .stMarkdown, [data-testid="stSidebar"] .stText {
    color: #e2e8f0 !important;
}

.card {
    background: white;
    border-radius: 16px;
    padding: 28px 20px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 2px solid transparent;
}
.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.14);
    border-color: #5645d4;
}
.card-icon { font-size: 48px; margin-bottom: 12px; }
.card-title { font-weight: 700; font-size: 16px; color: #1e293b; margin-bottom: 6px; }
.card-desc { font-size: 13px; color: #64748b; }
.card.active { border-color: #5645d4; background: #eff6ff; }

.ch-item {
    background: white;
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 10px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    border-left: 3px solid #5645d4;
}

div[data-testid="stHorizontalBlock"] button { width: 100% !important; }

.progress-wrap { background: #e2e8f0; border-radius: 4px; height: 6px; overflow: hidden; margin: 8px 0; }
.progress-fill { height: 100%; background: linear-gradient(90deg,#5645d4,#7b3ff2); border-radius: 4px; transition: width 0.3s; }

.tag-correct { background: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.tag-wrong { background: #fee2e2; color: #991b1b; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }

.stat-card { background: rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; text-align: center; }
.stat-num { font-size: 28px; font-weight: 700; color: #ffffff; }
.stat-lbl { font-size: 12px; color: #94a3b8; }
</style>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════
# 数据加载
# ══════════════════════════════════════════════════════
@st.cache_data(ttl=3600)
def load_quiz_data():
    with open(QUIZ_PATH, encoding='utf-8') as f:
        return json.load(f)


def strip_html(text):
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', str(text))
    text = text.replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>')
    text = text.replace('&#39;', "'").replace('&quot;', '"').replace('\\n', '\n').replace('\\r', '')
    return text.strip()


def resolve_course_path():
    """Resolve course directory; fallback to listing available PDFs if path missing."""
    if os.path.isdir(COURSE_DIR):
        return COURSE_DIR
    alt = os.path.join(BASE_DIR, "courseware")
    if os.path.isdir(alt):
        return alt
    return COURSE_DIR  # Streamlit will skip missing files gracefully


CHAPTERS = [
    {"id": "081-01", "name": "第一章 亚音速空气动力学", "en": "Subsonic Aerodynamics", "count": 470},
    {"id": "081-02", "name": "第二章 高速空气动力学", "en": "High Speed Aerodynamics", "count": 162},
    {"id": "081-03", "name": "第三章 失速/马赫下坠", "en": "Stall & Mach Tuck", "count": 219},
    {"id": "081-04", "name": "第四章 稳定性", "en": "Stability", "count": 151},
    {"id": "081-05", "name": "第五章 操控", "en": "Control", "count": 129},
    {"id": "081-06", "name": "第六章 限制", "en": "Limitations", "count": 124},
    {"id": "081-07", "name": "第七章 螺旋桨", "en": "Propellers", "count": 125},
    {"id": "081-08", "name": "第八章 飞行力学", "en": "Flight Mechanics", "count": 251},
]
CHAPTER_MAP = {c["id"]: c for c in CHAPTERS}


def filter_by_chapter(data, chapter_id):
    return [q for q in data if chapter_id in q.get("tags", "")]


# ══════════════════════════════════════════════════════
# 初始化 session_state
# ══════════════════════════════════════════════════════
if "page" not in st.session_state:
    st.session_state.page = "home"

if "total_answered" not in st.session_state:
    st.session_state.total_answered = 0
if "total_correct" not in st.session_state:
    st.session_state.total_correct = 0

if "quiz_questions" not in st.session_state:
    st.session_state.quiz_questions = []
if "quiz_idx" not in st.session_state:
    st.session_state.quiz_idx = 0
if "quiz_answers" not in st.session_state:
    st.session_state.quiz_answers = {}
if "quiz_submitted" not in st.session_state:
    st.session_state.quiz_submitted = False
if "quiz_mode" not in st.session_state:
    st.session_state.quiz_mode = "menu"

if "forum_posts" not in st.session_state:
    st.session_state.forum_posts = [
        {"id": 1, "title": "【置顶】飞行原理课程答疑帖",
         "content": "欢迎提问！24小时内回复。",
         "author": "助教老师", "role": "teacher", "time": "2025-09-01", "replies": 45, "views": 892, "chapter": 0},
        {"id": 2, "title": "关于失速速度的计算题求解",
         "content": "在做题时遇到关于失速速度的题目，公式用了但答案不对...",
         "author": "航宇小明", "role": "student", "time": "2025-10-12", "replies": 3, "views": 124, "chapter": 3},
        {"id": 3, "title": "襟翼角度与失速速度的关系",
         "content": "襟翼放下后CLmax增加，失速速度会降低吗？",
         "author": "飞行新手", "role": "student", "time": "2025-10-15", "replies": 2, "views": 89, "chapter": 2},
    ]
if "forum_replies" not in st.session_state:
    st.session_state.forum_replies = {
        2: [{"author": "助教老师", "role": "teacher", "time": "2025-10-12",
             "content": "公式正确，请检查：1.重量W是否换算成N；2.密度ρ是否与高度对应；3.CLmax值是否正确。"}],
        3: [{"author": "航宇达人", "role": "student", "time": "2025-10-15",
             "content": "襟翼放下后CLmax增加，失速速度确实会降低。角度越大，CLmax增加越多。"}],
    }

if "ai_messages" not in st.session_state:
    st.session_state.ai_messages = []


# ══════════════════════════════════════════════════════
# 侧边栏导航
# ══════════════════════════════════════════════════════
def nav_to(page_name):
    st.session_state.page = page_name
    st.rerun()


with st.sidebar:
    st.markdown("### ✈️ 小飞 · 飞行原理")
    st.markdown("飞行学员AI伴学平台")
    st.markdown("---")

    pages = [
        ("🤖", "AI导师（首页）", "home"),
        ("📝", "题库练习", "quiz"),
        ("📚", "课程资料", "materials"),
        ("💬", "讨论区", "forum"),
    ]
    for icon, label, name in pages:
        cls = "active" if st.session_state.page == name else ""
        if st.button(f"{icon}  {label}", use_container_width=True, key=f"nav_{name}"):
            nav_to(name)

    st.markdown("---")
    st.markdown("**📊 学习统计**")
    total = st.session_state.total_answered
    correct = st.session_state.total_correct
    acc = int(correct / total * 100) if total > 0 else 0
    st.metric("已答题", total)
    st.metric("正确率", f"{acc}%")

    st.markdown("---")
    st.markdown("""
    <div style="font-size:11px;color:#94a3b8;text-align:center;line-height:1.8">
    飞行原理 081 课程助手<br>
    北京航空航天大学<br>
    <span style="color:#7b3ff2">Powered by Streamlit</span>
    </div>
    """, unsafe_allow_html=True)


# ══════════════════════════════════════════════════════
# AI导师页（首页）
# ══════════════════════════════════════════════════════
def page_home():
    st.markdown("# 🤖 小飞 · AI导师")
    st.markdown("飞行学员的24小时智能学习助手，有问题随时问我！")
    st.markdown("---")

    QUICK_QS = [
        "什么是升力公式？L = ½ρv²SCᴸ",
        "伯努利原理在飞行中的具体应用",
        "什么是失速？如何识别和改出？",
        "襟翼的作用和使用场景",
        "飞机三种操纵方式原理",
        "什么是静稳定性与动稳定性？",
        "临界攻角和失速速度的关系",
        "爬升性能与哪些因素有关？",
    ]

    # 快捷问题
    with st.expander("💡 快捷问题（点击直接提问）"):
        cols = st.columns(2)
        for i, q in enumerate(QUICK_QS):
            with cols[i % 2]:
                if st.button(q, key=f"quick_{i}"):
                    st.session_state.ai_messages.append({"role": "user", "content": q})
                    st.session_state.ai_messages.append({"role": "assistant", "content": _get_local_answer(q)})
                    st.rerun()

    # 聊天历史
    for msg in st.session_state.ai_messages:
        with st.chat_message(msg["role"], avatar="🤖" if msg["role"] == "assistant" else None):
            st.markdown(msg["content"])

    # 输入框
    if prompt := st.chat_input("输入你的问题...", key="ai_input"):
        st.session_state.ai_messages.append({"role": "user", "content": prompt})
        api_key = os.environ.get("OPENAI_API_KEY", "")
        if api_key:
            reply = _call_openai(prompt, st.session_state.ai_messages[:-1])
        else:
            reply = _get_local_answer(prompt)
        st.session_state.ai_messages.append({"role": "assistant", "content": reply})
        st.rerun()

    st.markdown("---")
    if st.button("🗑️ 清空对话"):
        st.session_state.ai_messages = []
        st.rerun()

    if not os.environ.get("OPENAI_API_KEY"):
        st.info("💡 当前使用本地知识库。配置 `OPENAI_API_KEY` 环境变量可启用 AI 大模型回答。")


# ── 本地知识库 ──────────────────────────────────────────
def _get_local_answer(q: str) -> str:
    low = q.lower()

    if any(k in low for k in ["升力", "lift"]):
        return """## 【升力公式详解】

**升力公式**：L = ½ρv²SCL

| 参数 | 含义 | 单位 |
|------|------|------|
| ρ | 空气密度（海平面≈1.225 kg/m³） | kg/m³ |
| v | 气流相对速度 | m/s |
| S | 机翼面积 | m² |
| CL | 升力系数 | 无量纲 |

### 核心原理
升力源于**伯努利效应**：机翼上表面气流加速→压力降低；下表面流速慢→压力高 → 压差产生升力。

### 影响因素
1. **速度**：升力∝v²（速度加倍，升力×4）
2. **空气密度**：高海拔密度低，升力小
3. **机翼面积**：面积越大升力越大
4. **攻角**：在临界攻角内，攻角越大CL越大"""

    if any(k in low for k in ["伯努利", "bernoulli"]):
        return """## 【伯努利原理详解】

**伯努利方程**：P + ½ρv² = 常数

### 物理意义
流速增加 → 静压减小；流速减小 → 静压增加。

### 在飞行中的应用
1. 解释机翼升力产生（上表面低压、下表面高压）
2. 皮托管测量空速原理
3. 进气道设计

> 伯努利原理是空气动力学最基础的理论！"""

    if any(k in low for k in ["失速", "stall"]):
        return """## 【失速原理详解】

### 定义
**失速**：机翼超临界攻角后，气流分离导致升力急剧下降。

### 发生条件
- **临界攻角**：通常 15°-20°
- 低速飞行时更容易发生

### 改出方法
1. **立即向前推杆**减小攻角
2. 保持机翼水平
3. 适当加油门增加能量
4. 速度恢复后缓慢退出俯冲

### ⚠️ 重要提醒
**失速的本质是攻角超标，而非速度过低！**高速飞行时若攻角过大，同样失速。"""

    if any(k in low for k in ["襟翼", "flap"]):
        return """## 【襟翼作用原理】

### 主要作用
1. **增加CLmax**（增大机翼弯度）
2. **增加阻力**（帮助减速）

### 使用场景
| 阶段 | 角度 | 目的 |
|------|------|------|
| 起飞 | 5°-15° | 增大升力，缩短起飞距离 |
| 着陆 | 30°-40° | 增大升力+阻力，缩短着陆距离 |

> 这就是为什么起飞和着陆阶段需要使用襟翼！"""

    if any(k in low for k in ["操纵", "control", "副翼", "升降舵"]):
        return """## 【飞机操纵系统】

### 三种基本操纵
1. **俯仰**（升降舵）：拉杆→抬头，推杆→低头
2. **滚转**（副翼）：压杆→滚转
3. **偏航**（方向舵）：蹬舵→偏转

### 原理
操纵面偏转 → 产生气动力 → 对重心产生力矩 → 飞机绕轴转动"""

    if any(k in low for k in ["稳定", "stability"]):
        return """## 【飞机稳定性】

### 静稳定性 vs 动稳定性
- **静稳定性**：受扰后是否有回到原状态的倾向
- **动稳定性**：随时间收敛还是发散

### 三轴稳定性
- **纵向**（俯仰）：焦点位置决定稳定性
- **横向**（滚转）：上反角效应
- **航向**：垂尾面积决定

### 荷兰滚
横航向耦合的低频振荡，需要合适的阻尼。"""

    if any(k in low for k in ["临界攻角", "失速速度"]):
        return """## 【临界攻角与失速速度】

### 临界攻角
- 定义：CL达到最大值时的攻角
- 通常 15°-20°
- **与空速无关**，只与翼型有关

### 失速速度
**Vs = √(2W / ρSCLmax)**

结论：
- 速度越低，越容易失速
- 转弯载荷因数大 → 失速速度大
- 襟翼增加CLmax → 失速速度降低"""

    if any(k in low for k in ["爬升", "climb"]):
        return """## 【爬升性能】

### 爬升率
**ROC = (Pw - Pscr) / W**

### 决定因素
1. 剩余功率/推力
2. 重量（越重爬升率越低）
3. 密度高度（越高功率下降）

### 最佳爬升速度
- **Vx**（最佳爬升角速度）：最快到达高度
- **Vy**（最佳爬升率速度）：最快获得高度"""

    return f"""## 🤔 这是一个好问题！

你问的是：**「{q}」**

作为《飞行原理》AI助教，我可以解答：

- ✅ 空气动力学基础（升力、阻力、伯努利）
- ✅ 飞行性能（平飞、爬升、巡航、转弯）
- ✅ 稳定性与操纵（静/动稳定性、三轴操纵）
- ✅ 特殊飞行情景（失速、高速、结冰）
- ✅ 计算题思路（不直接给答案）

请具体描述问题，例如：「失速时为什么要向前推杆？」「襟翼30°和15°有什么区别？」

💡 也可以从上方快捷问题中选择。"""


def _call_openai(q: str, history: list) -> str:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
        messages = [{"role": "system", "content": "你是《飞行原理》课程的AI助教..."}]
        for m in history:
            messages.append({"role": m["role"], "content": m["content"]})
        messages.append({"role": "user", "content": q})
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=messages, max_tokens=2000)
        return resp.choices[0].message.content
    except Exception as e:
        return f"⚠️ API调用失败：{e}\n\n请确认 OPENAI_API_KEY 已正确设置。"


# ══════════════════════════════════════════════════════
# 课程资料页
# ══════════════════════════════════════════════════════
def page_materials():
    st.markdown("# 📚 课程资料")
    st.markdown("---")

    materials = [
        {"chapter": "第一章 飞机与大气", "items": [
            ("飞机基本知识介绍", "1-1飞机基本知识介绍2025-1班.pdf", "飞机基本构造、飞行原理概述"),
            ("大气环境基本知识", "1-2大气环境基本知识2025.pdf", "大气层结构、气压、温度对飞行的影响"),
        ]},
        {"chapter": "第二章 空气动力学基础", "items": [
            ("空气流动描述及流动规律", "2-1 空气流动描述及流动规律.pdf", "连续性方程、伯努利原理"),
            ("二维翼型升力特性", "2-2 二维翼型升力特性  -  已修复.pdf", "翼型几何参数、升力系数曲线"),
            ("二维翼型阻力特性", "2-3 二维翼型阻力特性.pdf", "摩擦阻力、压差阻力、诱导阻力"),
            ("三维机翼与全机低速空气动力", "2-4 三维机翼与全机低速空气动力.pdf", "展弦比、后掠角对气动特性的影响"),
            ("地面效应及尾流", "2-5 地面效应及尾流.pdf", "地面效应原理、尾流特性"),
            ("失速特性及失速告警", "2-6 失速特性及失速告警.pdf", "失速机理、失速速度"),
            ("失速识别改出与失速尾旋", "2-7 失速识别改出与失速尾旋.pdf", "失速识别方法、改出技术"),
        ]},
        {"chapter": "第三章 高速空气动力学", "items": [
            ("高速空气动力学基础 I", "3-1 高速空气动力学基础I.pdf", "音速、马赫数、激波与膨胀波"),
            ("高速空气动力学基础 II", "3-2 高速空气动力学基础II.pdf", "跨音速飞行、面积律"),
        ]},
        {"chapter": "第四章 螺旋桨空气动力学", "items": [
            ("螺旋桨空气动力学基础", "4-1 螺旋桨空气动力学基础.pdf", "桨叶角、进距比、效率"),
            ("螺旋桨附加效应", "4-2 螺旋桨附加效应.pdf", "滑流效应、P-factor"),
        ]},
        {"chapter": "第五章 稳定性与操纵性", "items": [
            ("飞机的平衡及稳定性概念", "5-1 飞机的平衡及稳定性概念.pdf", "静稳定性与动稳定性"),
            ("飞机的纵向静稳定性及操纵性", "5-2 飞机的纵向静稳定性及操纵性.pdf", "焦点位置、升降舵操纵"),
            ("飞机的横航向静稳定性", "5-3 飞机的横航向静稳定性.pdf", "上反角、后掠角影响"),
            ("飞机的横航向动稳定性及操纵性", "5-4 飞机的横航向动稳定性及操纵性.pdf", "荷兰滚、副翼操纵"),
        ]},
        {"chapter": "第六章 飞行性能", "items": [
            ("飞机的平飞性能与操纵", "6-1 飞机的平飞性能与操纵.pdf", "平飞所需速度、功率曲线"),
            ("飞机的爬升与下降", "6-2 飞机的爬升与下降.pdf", "爬升率、爬升角"),
            ("飞机的转弯与盘旋", "6-3飞机的转弯与盘旋1.pdf", "协调转弯、转弯半径"),
            ("飞机的起飞与着陆", "6-4 飞机的起飞与着陆.pdf", "起飞/着陆距离、安全速度"),
            ("风场下的飞行操纵", "6-5 风场下的飞行操纵.pdf", "侧风起飞、风切变"),
        ]},
        {"chapter": "第七章 特殊飞行条件", "items": [
            ("单发失效和最小操纵速度", "7-1 单发失效和最小操纵速度.pdf", "单发失效特性、Vmc"),
            ("飞行极限", "7-2 飞行极限.pdf", "飞行包线、极限载荷因数"),
            ("突风响应与气动弹性", "7-3 突风响应与气动弹性.pdf", "突风载荷、颤振"),
            ("机体污染与结冰条件下的飞行", "7-4 机体污染与结冰条件下的飞行.pdf", "结冰影响、防冰除冰"),
        ]},
    ]

    course_dir = resolve_course_path()

    for ch_data in materials:
        st.markdown(f"#### {ch_data['chapter']}")
        for title, filename, desc in ch_data["items"]:
            col_info, col_dl = st.columns([4, 1])
            with col_info:
                st.markdown(f"**{title}**")
                st.caption(f"📝 {desc}")
            with col_dl:
                fpath = os.path.join(course_dir, filename)
                if os.path.exists(fpath):
                    with open(fpath, "rb") as f:
                        st.download_button(
                            "⬇️ 下载", f,
                            file_name=filename,
                            mime="application/pdf",
                            key=f"dl_{filename[:20]}"
                        )
                else:
                    st.warning("文件未找到", icon="⚠️")
            st.divider()

    total_files = sum(len(ch["items"]) for ch in materials)
    st.success(f"共收录 {total_files} 个课件资料")


# ══════════════════════════════════════════════════════
# 题库练习页
# ══════════════════════════════════════════════════════
def page_quiz():
    if st.session_state.quiz_mode == "practicing" and st.session_state.quiz_questions:
        _render_quiz_session()
        return
    _render_quiz_menu()


def _render_quiz_menu():
    st.markdown("# 📝 题库练习")
    st.markdown("---")

    all_data = load_quiz_data()

    tab1, tab2, tab3, tab4 = st.tabs(["📖 分章节练习", "📋 全部题库", "🎲 随机练习", "⚔️ 闯关模式"])

    with tab1:
        st.markdown("### 选择章节开始练习")
        col1, col2 = st.columns(2)
        for i, ch in enumerate(CHAPTERS):
            with col1 if i % 2 == 0 else col2:
                st.markdown(f"""
                <div class="ch-item" style="margin-bottom:12px">
                    <div style="display:flex;align-items:center;gap:12px">
                        <div style="flex:1">
                            <div style="font-weight:bold;font-size:14px">{ch['name']}</div>
                            <div style="font-size:12px;color:#94a3b8">{ch['en']}</div>
                        </div>
                        <span style="background:#e8f0fe;color:#1a56db;padding:4px 10px;border-radius:20px;font-size:12px">{ch['count']}题</span>
                    </div>
                </div>
                """, unsafe_allow_html=True)

                q_list = filter_by_chapter(all_data, ch["id"])
                n = st.number_input("题目数", 5, min(50, len(q_list)), min(20, len(q_list)),
                                    key=f"n_{ch['id']}")
                if st.button(f"▶ 开始练习", key=f"start_{ch['id']}", use_container_width=True):
                    selected = random.sample(q_list, min(n, len(q_list)))
                    st.session_state.quiz_questions = selected
                    st.session_state.quiz_idx = 0
                    st.session_state.quiz_answers = {}
                    st.session_state.quiz_submitted = False
                    st.session_state.quiz_mode = "practicing"
                    st.rerun()

    with tab2:
        st.markdown("### 全部题库练习")
        st.info(f"题库共收录 {len(all_data)} 道题目")
        n_all = st.slider("题目数量", 10, 100, 30)
        if st.button("▶ 开始全部题库练习", type="primary", use_container_width=True):
            selected = random.sample(all_data, min(n_all, len(all_data)))
            st.session_state.quiz_questions = selected
            st.session_state.quiz_idx = 0
            st.session_state.quiz_answers = {}
            st.session_state.quiz_submitted = False
            st.session_state.quiz_mode = "practicing"
            st.rerun()

    with tab3:
        st.markdown("### 随机练习")
        n_rand = st.number_input("随机题目数量", 5, 50, 10, key="n_random")
        if st.button("▶ 开始随机练习", type="primary", use_container_width=True):
            selected = random.sample(all_data, min(n_rand, len(all_data)))
            st.session_state.quiz_questions = selected
            st.session_state.quiz_idx = 0
            st.session_state.quiz_answers = {}
            st.session_state.quiz_submitted = False
            st.session_state.quiz_mode = "practicing"
            st.rerun()

    with tab4:
        st.markdown("### 闯关模式")
        st.warning("⚔️ 从全部题目随机抽取，答错即失败！")
        if st.button("⚔️ 开始闯关", type="primary", use_container_width=True):
            shuffled = all_data[:]
            random.shuffle(shuffled)
            st.session_state.quiz_questions = shuffled
            st.session_state.quiz_idx = 0
            st.session_state.quiz_answers = {}
            st.session_state.quiz_submitted = False
            st.session_state.quiz_mode = "practicing"
            st.rerun()


def _render_quiz_session():
    questions = st.session_state.quiz_questions
    idx = st.session_state.quiz_idx

    if idx >= len(questions):
        st.success("🎉 恭喜完成所有题目！")
        if st.button("🏠 返回题库菜单"):
            st.session_state.quiz_mode = "menu"
            st.session_state.quiz_questions = []
            st.rerun()
        return

    q = questions[idx]
    total = len(questions)
    progress = (idx + 1) / total * 100

    col_back, col_info, col_exit = st.columns([1, 4, 1])
    with col_back:
        if st.button("← 返回菜单", use_container_width=True):
            st.session_state.quiz_mode = "menu"
            st.rerun()
    with col_info:
        st.markdown(f"""
        <div style="background:white;border-radius:8px;padding:10px 16px;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
            <div style="display:flex;align-items:center;gap:16px">
                <span style="background:#5645d4;color:white;padding:4px 12px;border-radius:20px;font-size:13px">
                    第 {idx+1} / {total} 题
                </span>
                <span style="color:#64748b;font-size:13px">{q.get('type','')}</span>
            </div>
            <div class="progress-wrap"><div class="progress-fill" style="width:{progress}%"></div></div>
        </div>
        """, unsafe_allow_html=True)
    with col_exit:
        if st.button("退出练习", use_container_width=True):
            st.session_state.quiz_mode = "menu"
            st.rerun()

    st.markdown("---")
    st.markdown(f"#### {strip_html(q.get('title', ''))}")

    options = []
    for key, letter in [("optionA", "A"), ("optionB", "B"), ("optionC", "C"), ("optionD", "D")]:
        text = strip_html(q.get(key, ""))
        if text:
            options.append((letter, text))

    user_ans = st.session_state.quiz_answers.get(idx)
    submitted = st.session_state.quiz_submitted

    for letter, text in options:
        is_correct = (letter == q.get("correctAns", "").strip())
        is_selected = (user_ans == letter)

        if submitted:
            if is_correct:
                label = f"✅ **{letter}.** {text} ← 正确答案"
            elif is_selected and not is_correct:
                label = f"❌ **{letter}.** {text} ← 你的选择"
            else:
                label = f"　 **{letter}.** {text}"
        else:
            if is_selected:
                label = f"🔘 **{letter}.** {text}"
            else:
                label = f"　 **{letter}.** {text}"

        if st.button(label, key=f"opt_{idx}_{letter}", use_container_width=True):
            if not submitted:
                st.session_state.quiz_answers[idx] = letter
                st.rerun()
        st.divider()

    if submitted:
        exp = strip_html(q.get("explanationTotal", ""))
        if exp:
            with st.expander("📖 查看解析", expanded=True):
                st.markdown(exp)

    col_prev, col_jump, col_sub, col_next = st.columns(4)
    with col_prev:
        if idx > 0:
            if st.button("◀ 上一题", use_container_width=True):
                st.session_state.quiz_idx -= 1
                st.rerun()
    with col_next:
        if idx < total - 1:
            if st.button("下一题 ▶", use_container_width=True):
                st.session_state.quiz_idx += 1
                st.rerun()
    with col_sub:
        if not submitted:
            if st.button("✅ 提交答案", type="primary", use_container_width=True):
                st.session_state.quiz_submitted = True
                if st.session_state.quiz_answers.get(idx):
                    st.session_state.total_answered += 1
                    if st.session_state.quiz_answers[idx] == q.get("correctAns", "").strip():
                        st.session_state.total_correct += 1
                st.rerun()
        else:
            if st.button("📋 继续答题", type="primary", use_container_width=True):
                st.session_state.quiz_idx += 1
                st.session_state.quiz_submitted = False
                st.rerun()
    with col_jump:
        if st.button("🔀 换一题", use_container_width=True):
            ni = random.randint(0, total - 1)
            st.session_state.quiz_idx = ni
            st.session_state.quiz_submitted = False
            st.rerun()


# ══════════════════════════════════════════════════════
# 讨论区页
# ══════════════════════════════════════════════════════
def page_forum():
    st.markdown("# 💬 讨论区")
    st.markdown("---")

    with st.expander("✏️ 发布新帖"):
        new_title = st.text_input("标题", placeholder="请输入帖子标题...")
        new_content = st.text_area("内容", placeholder="请详细描述你的问题...", height=120)
        col_a, col_b = st.columns([2, 1])
        chapters_opt = ["全部", "第一章", "第二章", "第三章", "第四章", "第五章", "第六章", "第七章"]
        with col_a:
            sel_ch = st.selectbox("关联章节", chapters_opt)
        with col_b:
            author = st.text_input("昵称", value="匿名用户")
        if st.button("发布帖子", type="primary"):
            if new_title and new_content:
                new_id = max([p["id"] for p in st.session_state.forum_posts], default=0) + 1
                ch_idx = chapters_opt.index(sel_ch) if sel_ch in chapters_opt else 0
                st.session_state.forum_posts.insert(0, {
                    "id": new_id, "title": new_title, "content": new_content,
                    "author": author, "role": "student",
                    "time": datetime.date.today().isoformat(),
                    "replies": 0, "views": 0, "chapter": ch_idx,
                })
                st.success("发布成功！")
                st.rerun()

    st.markdown("---")

    for post in st.session_state.forum_posts:
        role_badge = "👨‍🏫 教师" if post["role"] == "teacher" else "👨‍🎓 学生"
        view_key = f"view_{post['id']}"
        is_viewing = st.session_state.get(view_key, False)

        with st.container():
            col1, col2 = st.columns([4, 1])
            with col1:
                st.markdown(f"**{post['title']}**")
                st.markdown(post["content"][:150] + ("..." if len(post["content"]) > 150 else ""))
                st.caption(f"{role_badge} · {post['author']} · {post['time']} · 👁 {post['views']} · 💬 {post['replies']}")
            with col2:
                btn_label = "📖 已展开" if is_viewing else "📖 查看详情"
                if st.button(btn_label, key=f"btn_{post['id']}"):
                    st.session_state[view_key] = not is_viewing
                    st.rerun()

            if is_viewing:
                st.markdown("**💬 回复**")
                replies = st.session_state.forum_replies.get(post["id"], [])
                for r in replies:
                    r_badge = "👨‍🏫 教师" if r["role"] == "teacher" else "👨‍🎓 学生"
                    st.markdown(f"""
                    <div style="background:#f8fafc;border-radius:8px;padding:10px 14px;margin-bottom:8px;border-left:3px solid #5645d4">
                        <strong>{r['author']}</strong> {r_badge} · <span style="color:#94a3b8;font-size:12px">{r['time']}</span><br>
                        {r['content']}
                    </div>
                    """, unsafe_allow_html=True)

                r_content = st.text_area("写下回复...", key=f"rc_{post['id']}", height=60)
                r_author = st.text_input("你的昵称", key=f"ra_{post['id']}", value="匿名用户")
                if st.button("发送回复", key=f"sr_{post['id']}"):
                    if r_content:
                        if post["id"] not in st.session_state.forum_replies:
                            st.session_state.forum_replies[post["id"]] = []
                        st.session_state.forum_replies[post["id"]].append({
                            "author": r_author, "role": "student",
                            "time": datetime.date.today().isoformat(), "content": r_content,
                        })
                        for p in st.session_state.forum_posts:
                            if p["id"] == post["id"]:
                                p["replies"] += 1
                                break
                        st.rerun()

            st.markdown("---")


# ══════════════════════════════════════════════════════
# 路由
# ══════════════════════════════════════════════════════
current_page = st.session_state.page

if current_page == "home":
    page_home()
elif current_page == "materials":
    page_materials()
elif current_page == "quiz":
    page_quiz()
elif current_page == "forum":
    page_forum()
