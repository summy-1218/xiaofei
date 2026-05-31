"""题库 API v1.2 — 含学情统计 + 快捷入口 + 章节进度 + 题目图片"""
from __future__ import annotations

import os
import random
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from app.services.course_data import (
    get_question,
    list_chapters as load_chapters,
    practice_questions,
    load_questions,
)

router = APIRouter()

# Figures 目录
FIGURES_DIR = Path(__file__).resolve().parents[3] / "data" / "quiz" / "Figures"


class PracticeRequest(BaseModel):
    mode: str  # chapter | random | challenge
    chapter_id: str | None = None       # 兼容旧版单章
    chapter_ids: list[str] | None = None  # 新版多章
    count: int = 20


class SubmitRequest(BaseModel):
    question_id: str
    answer: str


# ── 题目图片 ──────────────────────────────────
@router.get("/figures/{filename}")
async def get_figure(filename: str):
    """获取题目配图"""
    filepath = FIGURES_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="图片未找到")
    return FileResponse(str(filepath), media_type="image/png")


# ── 学情统计 ──────────────────────────────────
@router.get("/stats")
async def get_stats(course_code: str = "081"):
    """学情 KPI 条数据"""
    all_qs = load_questions()
    total = len(all_qs)

    # demo: 模拟已练习数据
    attempted = random.randint(280, 520)
    accuracy = round(random.uniform(72, 88), 1)
    today_new = random.randint(5, 30)

    return [
        {"key": "total", "label": "总题量", "value": f"{total:,}"},
        {"key": "attempted", "label": "已练习", "value": f"{attempted} / {round(attempted/total*100)}%"},
        {
            "key": "accuracy",
            "label": "正确率",
            "value": f"{accuracy}%",
            "delta": {"value": round(random.uniform(1, 5), 1), "positive": True},
        },
        {"key": "todayNew", "label": "今日新增", "value": f"+{today_new}"},
    ]


# ── 快捷入口 ──────────────────────────────────
@router.get("/quick")
async def get_quick(course_code: str = "081"):
    """快捷入口数据（继续上次/错题本/收藏/模考）"""
    return {
        "resume": {
            "sessionId": "demo-session-1",
            "chapterTitle": "亚音速空气动力学",
            "cursor": 12,
            "total": 30,
            "accuracy": 83,
        },
        "wrongCount": 47,
        "favCount": 23,
        "mockReady": True,
    }


# ── 章节列表（含进度） ──────────────────────────
@router.get("/chapters")
async def list_chapters(course_id: str = "081"):
    """获取课程章节列表及题目数 + 模拟进度"""
    chapters = load_chapters()
    for ch in chapters:
        ch["progress"] = round(random.uniform(0.1, 0.95), 2)
    return chapters


# ── 开始练习 ──────────────────────────────────
@router.post("/practice")
async def start_practice(req: PracticeRequest):
    """开始一次练习，返回题目列表（支持多章）"""
    chapter = req.chapter_id or (req.chapter_ids[0] if req.chapter_ids else None)
    extra_chapters = req.chapter_ids[1:] if req.chapter_ids and len(req.chapter_ids) > 1 else []
    return {
        "questions": practice_questions(req.mode, req.count, chapter, extra_chapters)
    }


# ── 提交答案 ──────────────────────────────────
@router.post("/submit")
async def submit_answer(req: SubmitRequest):
    """提交答案并返回正误判断 + 解析"""
    question = get_question(req.question_id)
    if not question:
        return {"is_correct": False, "explanation": "题目不存在或已被移除。"}

    user_answer = req.answer.strip().upper()
    is_correct = user_answer == question["correct"]
    return {
        "is_correct": is_correct,
        "correct_answer": question["correct"],
        "explanation": question["explanation"],
    }


# ── 错题本 ────────────────────────────────────
@router.get("/wrong-book")
async def get_wrong_book():
    """获取用户的错题本"""
    return practice_questions("random", 8)
