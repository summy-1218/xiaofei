"""消息历史存储 v1.1 — 内存字典，按 thread_id 索引

生产环境替换为 PostgreSQL messages 表。
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

# {thread_id: [{"role": "user"|"assistant", "content": "...", "created_at": "..."}, ...]}
_store: dict[str, list[dict[str, Any]]] = {}

MAX_TURNS = 20       # 最多 20 轮（40 条消息）
MAX_TOKENS_EST = 60000  # 软上限，DeepSeek V4 1M 上下文很宽裕


def create_thread() -> str:
    """新建对话线程，返回 thread_id"""
    tid = str(uuid.uuid4())[:12]
    _store[tid] = []
    return tid


def save_message(thread_id: str, role: str, content: str) -> None:
    """存一条消息（user 存原始问题，assistant 存纯回答）"""
    if thread_id not in _store:
        _store[thread_id] = []
    # 控制历史长度
    if len(_store[thread_id]) >= MAX_TURNS * 2:
        _store[thread_id] = _store[thread_id][-(MAX_TURNS * 2 - 1) :]

    _store[thread_id].append({
        "role": role,
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })


def get_history(thread_id: str) -> list[dict[str, Any]]:
    """获取对话历史（时间正序）"""
    return _store.get(thread_id, [])


def build_messages(
    thread_id: str,
    new_question: str,
    context: str = "",
) -> list[dict[str, Any]]:
    """构建发给 LLM 的完整 messages 数组

    thread_id 由前端生成并传入，后端直接使用。
    首次调用时 auto-create，后续调用读写已有历史。
    """
    from app.core.llm import SYSTEM_PROMPT

    if thread_id not in _store:
        _store[thread_id] = []

    history = get_history(thread_id)

    # 拼装: system → 历史 → 当前问题（含 RAG context）
    messages: list[dict[str, Any]] = [
        {"role": "system", "content": SYSTEM_PROMPT},
    ]
    for m in history:
        messages.append({"role": m["role"], "content": m["content"]})

    # 当前 user message: context 只注入这一轮，不存库
    user_content = new_question
    if context:
        user_content = (
            f"<context>\n{context}\n</context>\n\n"
            f"<question>\n{new_question}\n</question>"
        )

    messages.append({"role": "user", "content": user_content})

    # Token 裁剪
    while _estimate_tokens(messages) > MAX_TOKENS_EST and len(messages) > 3:
        messages.pop(1)

    return messages


def _estimate_tokens(messages: list[dict]) -> int:
    """粗略 token 估算：中文约 1.5 字/token，英文约 4 字/token"""
    total = 0
    for m in messages:
        text = m.get("content", "")
        # 简单按字符数估算
        total += len(text) // 2
    return total
