"""小飞 AI 伴学平台 — Streamlit Cloud 入口"""
import streamlit as st

st.set_page_config(page_title="小飞 · 飞行学员智能助手", page_icon="✈️", layout="wide")

st.markdown("""
<style>
footer { visibility: hidden; }
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0a1530 0%, #070f24 100%);
}
[data-testid="stSidebar"] .stMarkdown, [data-testid="stSidebar"] .stText { color: #e2e8f0 !important; }
</style>
""", unsafe_allow_html=True)

st.sidebar.markdown("### ✈️ 小飞 · 飞行原理")
st.sidebar.markdown("飞行学员AI伴学平台")
st.sidebar.markdown("---")

page = st.sidebar.radio("导航", ["🤖 AI导师", "📝 题库练习", "📚 课程资料", "💬 讨论社区"])

if page == "🤖 AI导师":
    st.markdown("# 🤖 小飞 · AI导师")
    st.markdown("飞行学员的24小时智能学习助手，有问题随时问我！")
    st.markdown("---")
    st.info("🚀 Streamlit Cloud 版本正在建设中。完整功能请本地运行 `cd frontend && npm run dev`。")

elif page == "📝 题库练习":
    st.markdown("# 📝 题库练习")
    st.info("🚀 题库模块即将上线。已收录 1631 道飞行原理题目。")

elif page == "📚 课程资料":
    st.markdown("# 📚 课程资料")
    st.info("🚀 资料模块即将上线。已收录 26 个课件 PDF。")

elif page == "💬 讨论社区":
    st.markdown("# 💬 讨论社区")
    st.info("🚀 社区模块即将上线。")
