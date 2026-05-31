"""Local course assets for the demo.

The demo intentionally reads the files already placed under ``data`` so it can
run without PostgreSQL, Chroma, Neo4j, or an external LLM key.
"""
from __future__ import annotations

import html
import json
import random
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = ROOT_DIR / "data"
COURSEWARE_DIR = DATA_DIR / "courseware" / "飞行原理"
QUIZ_JSON = DATA_DIR / "quiz" / "081_modify_Wang.json"

CHAPTER_NAMES: dict[str, tuple[str, str]] = {
    "081-01": ("亚音速空气动力学", "Subsonic Aerodynamics"),
    "081-02": ("螺旋桨", "Propellers"),
    "081-03": ("失速、马赫下俯与改出", "Stall, Mach Tuck and UPRT"),
    "081-04": ("稳定性", "Stability"),
    "081-05": ("操纵", "Control"),
    "081-06": ("限制", "Limitations"),
    "081-07": ("性能", "Performance"),
    "081-08": ("飞行力学", "Flight Mechanics"),
}

CHAPTER_ALIASES: dict[str, str] = {
    "1": "飞机与大气",
    "2": "空气动力学基础",
    "3": "高速空气动力学",
    "4": "螺旋桨空气动力学",
    "5": "稳定性与操纵性",
    "6": "飞行性能",
    "7": "特殊飞行条件",
}

KEY_CONCEPTS = [
    {
        "name": "升力公式",
        "keywords": ["lift", "升力", "cl", "angle of attack", "攻角"],
        "summary": "升力由动压、机翼面积和升力系数共同决定：$L=\\frac{1}{2}\\rho V^2SC_L$。平飞时升力近似等于重量，速度增加时通常需要减小攻角来保持平衡。",
        "source": "2-2 二维翼型升力特性  -  已修复.pdf",
    },
    {
        "name": "失速与临界攻角",
        "keywords": ["stall", "失速", "critical angle", "临界攻角", "boundary layer"],
        "summary": "失速的直接原因是超过临界攻角后上翼面气流大范围分离，升力系数下降并伴随阻力增加。改出学习应围绕减小攻角、恢复能量和保持方向控制来理解。",
        "source": "2-6 失速特性及失速告警.pdf",
    },
    {
        "name": "伯努利与连续性",
        "keywords": ["bernoulli", "伯努利", "continuity", "连续性", "pressure"],
        "summary": "在适用条件下，流速增大对应静压降低；连续性方程说明流管截面积变化会引起流速变化。这是理解空速测量、翼型压力分布和升力形成的基础。",
        "source": "2-1 空气流动描述及流动规律.pdf",
    },
    {
        "name": "稳定性",
        "keywords": ["stability", "稳定", "cg", "重心", "stick force"],
        "summary": "重心位置会改变静稳定性和杆力梯度。重心前移通常提高纵向稳定性，但会增加操纵力需求，需要在安全裕度和操纵品质之间平衡。",
        "source": "5-1 飞机的平衡及稳定性概念.pdf",
    },
    {
        "name": "单发失效",
        "keywords": ["engine failure", "单发", "vmc", "最小操纵速度", "asymmetric"],
        "summary": "多发飞机单发失效后会出现不对称推力导致的偏航，并可能诱发向失效发动机一侧的滚转。最小操纵速度相关知识需要结合方向舵效能、构型和推力状态理解。",
        "source": "7-1 单发失效和最小操纵速度.pdf",
    },
]


def _strip_html(value: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", value or "", flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def _chapter_from_tags(tags: str) -> str:
    match = re.search(r"081-\d{2}", tags or "")
    return match.group(0) if match else "081-01"


@lru_cache(maxsize=1)
def load_questions() -> list[dict[str, Any]]:
    with QUIZ_JSON.open("r", encoding="utf-8") as file:
        raw_questions = json.load(file)

    questions: list[dict[str, Any]] = []
    for index, item in enumerate(raw_questions):
        chapter_id = _chapter_from_tags(str(item.get("tags", "")))
        explanation = _strip_html(str(item.get("explanationTotal", "")))
        title_img = str(item.get("title-img", "")).strip()
        ans_img = str(item.get("ans-img", "")).strip()
        question = {
            "id": str(item.get("eid") or item.get("guid") or f"Q{index:05d}"),
            "course_id": "081",
            "chapter_id": chapter_id,
            "chapter_name": CHAPTER_NAMES.get(chapter_id, (chapter_id, chapter_id))[0],
            "type": "单选题",
            "difficulty": 2 + (index % 3),
            "title": _strip_html(str(item.get("title", ""))),
            "options": {
                key: _strip_html(str(item.get(f"option{key}", "")))
                for key in ["A", "B", "C", "D"]
                if item.get(f"option{key}")
            },
            "correct": str(item.get("correctAns", "")).strip().upper(),
            "explanation": explanation or "该题暂无解析，可点击 AI 导师继续追问相关知识点。",
            "img": f"/api/quiz/figures/{title_img}" if title_img else "",
            "ans_img": f"/api/quiz/figures/{ans_img}" if ans_img else "",
            "tags": str(item.get("tags", "")),
        }
        if question["title"] and len(question["options"]) >= 2 and question["correct"]:
            questions.append(question)
    return questions


def list_chapters() -> list[dict[str, Any]]:
    counts: dict[str, int] = {chapter_id: 0 for chapter_id in CHAPTER_NAMES}
    for question in load_questions():
        counts[question["chapter_id"]] = counts.get(question["chapter_id"], 0) + 1

    return [
        {
            "id": chapter_id,
            "course_id": "081",
            "name": f"{chapter_id} {name}",
            "en_name": en_name,
            "question_count": counts.get(chapter_id, 0),
        }
        for chapter_id, (name, en_name) in CHAPTER_NAMES.items()
    ]


def get_question(question_id: str) -> dict[str, Any] | None:
    return next((q for q in load_questions() if q["id"] == question_id), None)


def practice_questions(
    mode: str,
    count: int,
    chapter_id: str | None = None,
    extra_chapters: list[str] | None = None,
) -> list[dict[str, Any]]:
    pool = load_questions()
    # 构建选中章节集合
    chapter_set: set[str] = set()
    if chapter_id:
        chapter_set.add(chapter_id)
    if extra_chapters:
        chapter_set.update(extra_chapters)

    if mode == "chapter" and chapter_set:
        pool = [q for q in pool if q["chapter_id"] in chapter_set]
    elif mode == "challenge":
        pool = sorted(pool, key=lambda q: q["difficulty"], reverse=True)

    count = max(1, min(count, len(pool)))  # 不硬封顶，全量时传大数即可
    if mode == "challenge":
        selected = pool[:count]
    else:
        selected = random.sample(pool, count)
    return [_public_question(q) for q in selected]


def _public_question(question: dict[str, Any]) -> dict[str, Any]:
    """返回题目（含正确答案+解析，前端自行判题）"""
    return {
        "id": question["id"],
        "course_id": question["course_id"],
        "chapter_id": question["chapter_id"],
        "type": question["type"],
        "difficulty": question["difficulty"],
        "title": question["title"],
        "options": question["options"],
        "correct": question["correct"],
        "explanation": question.get("explanation", ""),
        "img": question.get("img", ""),
        "ans_img": question.get("ans_img", ""),
    }


def list_materials() -> list[dict[str, Any]]:
    materials = []
    for index, path in enumerate(sorted(COURSEWARE_DIR.glob("*.pdf")), start=1):
        match = re.match(r"(\d+)-(\d+)\s*(.+)\.pdf$", path.name)
        major = match.group(1) if match else "0"
        chapter = CHAPTER_ALIASES.get(major, "飞行原理")
        title = (match.group(3) if match else path.stem).replace("  -  已修复", "")
        # 判断类型：Oxford 等无编号文件为补充读物
        mtype = "reading" if not match else "ppt"
        desc = (
            "补充读物" if mtype == "reading"
            else f"飞行原理课程课件：{title}"
        )
        materials.append(
            {
                "id": str(index),
                "course_id": "081",
                "chapter": chapter,
                "title": title,
                "filename": path.name,
                "size": _format_size(path.stat().st_size),
                "description": desc,
                "path": str(path),
                "type": mtype,
            }
        )
    return materials


def get_material(material_id: str) -> dict[str, Any] | None:
    return next((m for m in list_materials() if m["id"] == material_id), None)


def _format_size(size: int) -> str:
    mb = size / 1024 / 1024
    return f"{mb:.1f} MB"


def search_course_context(query: str, limit: int = 4) -> list[dict[str, str]]:
    query_lower = query.lower()
    hits: list[tuple[int, dict[str, str]]] = []

    for concept in KEY_CONCEPTS:
        score = sum(1 for keyword in concept["keywords"] if keyword.lower() in query_lower)
        if score:
            hits.append((score + 5, concept))

    for question in load_questions()[:1200]:
        haystack = f"{question['title']} {question['explanation']} {question['tags']}".lower()
        tokens = [token for token in re.split(r"\W+", query_lower) if len(token) > 2]
        score = sum(1 for token in tokens if token in haystack)
        if score:
            hits.append(
                (
                    score,
                    {
                        "name": question["chapter_name"],
                        "summary": f"相关题目：{question['title']}\n解析要点：{question['explanation'][:260]}",
                        "source": question["tags"] or question["chapter_id"],
                    },
                )
            )

    if not hits:
        hits = [(1, concept) for concept in KEY_CONCEPTS[:3]]

    hits.sort(key=lambda item: item[0], reverse=True)
    return [hit for _, hit in hits[:limit]]


def build_local_answer(question: str, context_items: list[dict[str, str]] | None = None) -> str:
    items = context_items or search_course_context(question)
    primary = items[0]
    related = "、".join(item["name"] for item in items[1:4])
    sources = "\n".join(f"- {item['source']}" for item in items[:3])

    return (
        f"## {primary['name']}\n\n"
        f"{primary['summary']}\n\n"
        "### 学习抓手\n"
        "1. 先判断题目讨论的是力、运动状态、构型变化还是稳定/操纵品质。\n"
        "2. 把相关变量写成公式或因果链，再看哪个变量被题干改变。\n"
        "3. 遇到计算题时先列已知量和单位，小飞会按步骤引导你完成中间量检查。\n\n"
        f"### 关联知识\n{related or '升力、阻力、稳定性、飞行性能'}\n\n"
        f"### 参考资料\n{sources}"
    )
