"""学情分析 API"""
from fastapi import APIRouter
from app.services.course_data import list_chapters

router = APIRouter()


@router.get("/overview")
async def get_overview():
    """获取用户学习概览统计"""
    chapters = list_chapters()
    return {
        "total_answered": 128,
        "total_correct": 105,
        "accuracy": 82,
        "streak_days": 15,
        "study_minutes_today": 45,
        "chapter_progress": [
            {"chapter_id": chapter["id"], "name": chapter["name"], "progress": max(28, 86 - index * 7)}
            for index, chapter in enumerate(chapters)
        ],
    }


@router.get("/knowledge-map")
async def get_knowledge_map():
    """获取知识点掌握度图谱数据"""
    return {
        "nodes": [
            {"id": "lift", "name": "升力公式", "mastery": 82},
            {"id": "bernoulli", "name": "伯努利原理", "mastery": 76},
            {"id": "stall", "name": "失速识别与改出", "mastery": 54},
            {"id": "stability", "name": "纵向稳定性", "mastery": 63},
            {"id": "vmc", "name": "最小操纵速度", "mastery": 41},
        ],
        "edges": [
            {"source": "bernoulli", "target": "lift", "relation": "支撑"},
            {"source": "lift", "target": "stall", "relation": "关联"},
            {"source": "stability", "target": "vmc", "relation": "应用"},
        ],
    }
