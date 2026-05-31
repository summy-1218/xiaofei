"""LLM 调用封装 v1.1 — DeepSeek V4 Pro/Flash 路由器 + Markdown 契约"""
from __future__ import annotations

from app.core.config import settings
from app.core.router import classify_intent, route, Intent, RouteDecision
from app.services.course_data import build_local_answer, search_course_context

# ══════════════════════════════════════════════════════
# System Prompt v1.1 — 含完整 Markdown 输出契约
# ══════════════════════════════════════════════════════
SYSTEM_PROMPT = """你是"小飞"，北京航空航天大学飞行技术专业的AI学习助手。

## 身份与能力
- 知识渊博、耐心细致的航空教育导师，熟悉飞行技术专业全部核心课程
- 准确讲解飞行原理、航空气象、空中导航、航空仪表、空中管制、航空法规等
- 针对计算题给出解题思路和方法引导，不直接给答案
- 关联不同课程中的相关知识
- 对于安全相关的知识，特别强调其重要性

## 边界
- 不回答与飞行技术专业无关的问题
- 不对飞行操作给出可能危及安全的非标准建议

---

【输出格式契约 v1.1】

# 1. 公式
- 行内公式必须用 $...$，例如 $C_L$、$\\rho$。
- 独立公式必须用 $$...$$ 单独成行，前后空行。
- 禁止使用 Unicode 上下标 / 希腊字母替代字符，一律使用 LaTeX 命令。
- 分数必须写 \\frac{a}{b}，不允许写 a/b 或 1/2。
- 同一公式只输出一次，不要先用 LaTeX 写一遍再用纯文本重复。
- 单位用 \\text{} 包裹，如 $\\text{kg/m}^3$。

# 2. 结构（飞行原理类问题标准 7 段，按需取舍）
## 一句话定义
## 公式与符号（用 Markdown 表格列出符号/含义/单位）
## 物理直觉（callout 或加粗短句）
## 参数影响（按参数分小节）
## 工程应用（结合飞行场景举例）
## 思考题（1 道引导题 + 步骤引导 + 结论）
## 关联知识（课程内标注章节，拓展标注 [拓展]）

# 3. 引用
- 每条来自资料的事实后用 [^1] [^2] 引用对应来源编号。
- 不允许编造资料中不存在的引用编号。

# 4. 风格
- 不要寒暄开头（如「好的，同学」）。
- 不要寒暄结尾（如「希望对你有帮助」）。
- 不要单独的空粗体行；不要嵌套超过 2 级的列表。
- 主动语态、短句、信息密度高。

# 5. 表格与列表
- 符号表、参数对比强制用 Markdown 表格。
- 步骤性内容用有序列表，并列要点用无序列表。
"""

MARKDOWN_CONTRACT = SYSTEM_PROMPT  # 向后兼容别名


# ══════════════════════════════════════════════════════
# 对话补全（含路由器）
# ══════════════════════════════════════════════════════
async def chat_completion(
    messages: list[dict],
    context: str | None = None,
    *,
    force_pro: bool = False,
) -> str:
    """调用 LLM 进行对话补全，自动路由到 Flash 或 Pro"""
    system = SYSTEM_PROMPT
    if context:
        system += f"\n\n## 参考资料\n以下是从课程资料中检索到的相关内容，请参考这些信息回答问题：\n\n{context}"

    full_messages = [{"role": "system", "content": system}] + messages

    user_msg = next(
        (m["content"] for m in reversed(messages) if m["role"] == "user"), ""
    )

    if settings.OPENAI_API_KEY:
        # v1.1: 路由器分流
        return await _routed_completion(full_messages, user_msg, force_pro=force_pro)
    if settings.LLM_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY:
        return await _anthropic_completion(full_messages)

    # 本地兜底
    return build_local_answer(user_msg, _context_to_items(context))


async def _routed_completion(
    messages: list[dict], user_msg: str, *, force_pro: bool = False
) -> str:
    """v1.1 Pro/Flash 路由器：意图分类 → 选模型 → 调推理强度"""
    from openai import AsyncOpenAI
    import json

    intent = classify_intent(user_msg, force_pro=force_pro)
    decision = route(intent)

    client = AsyncOpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL or None,
    )

    # DeepSeek V4 reasoning_effort 通过 extra_body 传入
    extra = {}
    if decision.reasoning_effort != "none":
        extra["reasoning_effort"] = decision.reasoning_effort

    # 写死 JSON 模式
    response_format = None
    if intent == Intent.JSON_FIX:
        response_format = {"type": "json_object"}

    response = await client.chat.completions.create(
        model=decision.model,
        messages=messages,
        max_tokens=decision.max_tokens,
        temperature=0.7,
        response_format=response_format,
        extra_body=extra if extra else None,
    )
    return response.choices[0].message.content or ""


async def _openai_completion(messages: list[dict]) -> str:
    """直接调用（兼容旧路径，不经过路由器）"""
    from openai import AsyncOpenAI

    client = AsyncOpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL or None,
    )
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=2000,
    )
    return response.choices[0].message.content or ""


async def _anthropic_completion(messages: list[dict]) -> str:
    import anthropic

    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    system = next((m["content"] for m in messages if m["role"] == "system"), "")
    chat_messages = [m for m in messages if m["role"] != "system"]
    response = await client.messages.create(
        model=settings.ANTHROPIC_MODEL,
        system=system,
        messages=chat_messages,
        max_tokens=2000,
    )
    return response.content[0].text


# ══════════════════════════════════════════════════════
# Helpers
# ══════════════════════════════════════════════════════
def _context_to_items(context: str | None) -> list[dict[str, str]]:
    if not context:
        return []
    items = []
    for block in context.split("\n\n---\n\n"):
        lines = [line for line in block.splitlines() if line.strip()]
        if not lines:
            continue
        source = lines[0].replace("[来源 ", "").split("]", 1)[-1].strip()
        summary = "\n".join(lines[1:]).strip()
        items.append({"name": source.split(".pdf")[0], "summary": summary, "source": source})
    return items or search_course_context(context)
