"""对话 API v1.2 — 多轮上下文修复"""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel
from app.core.llm import chat_completion
from app.core.rag import build_context
from app.services.message_store import (
    build_messages,
    save_message,
    get_history,
    create_thread,
)
from app.services.course_data import search_course_context

router = APIRouter()


class SendRequest(BaseModel):
    thread_id: str                     # 前端生成的线程 ID（必传）
    message: str
    course_id: str = "081"
    force_pro: bool = False


class SendResponse(BaseModel):
    thread_id: str
    reply: dict


@router.post("/send", response_model=SendResponse)
async def send_message(req: SendRequest):
    """发送消息并获取 AI 回复 — 带完整多轮上下文"""
    # 1. RAG 检索
    context = await build_context(req.message, req.course_id)

    # 2. 构建完整 messages（含历史）
    thread_id = req.thread_id
    messages = build_messages(
        thread_id,
        req.message,
        context if context else "",
    )

    # 3. 存用户消息（存原始问题，不带 <context>）
    save_message(thread_id, "user", req.message)

    # 4. LLM 调用（messages 已含完整历史 + RAG context）
    reply_content = await chat_completion(
        messages=messages,
        context=None,  # context 已注入到 messages 的当前 user 轮
        force_pro=req.force_pro,
    )

    # 5. 存助手回复（存纯文本，不带 thinking）
    save_message(thread_id, "assistant", reply_content)

    # 6. 提取引用
    citations = _extract_citations(context) if context else _local_citations(req.message)

    reply = {
        "id": f"ai-{thread_id}",
        "role": "assistant",
        "content": reply_content,
        "citations": citations,
        "created_at": "2026-05-31T00:00:00Z",
    }

    return SendResponse(thread_id=thread_id, reply=reply)


@router.get("/sessions")
async def list_sessions():
    """获取用户的对话历史列表"""
    return []


@router.get("/sessions/{thread_id}/messages")
async def get_session_messages(thread_id: str):
    """获取指定线程的消息列表"""
    return get_history(thread_id)


def _extract_citations(context: str) -> list[dict]:
    if not context:
        return []
    citations = []
    for line in context.split("\n"):
        if line.startswith("[来源 "):
            source = line.split("]", 1)[-1].strip()
            citations.append({"source": source or "课程资料", "page": 0})
    return citations[:3]


def _local_citations(query: str) -> list[dict]:
    return [{"source": item["source"], "page": 0} for item in search_course_context(query, 3)]
