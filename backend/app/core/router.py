"""Pro/Flash 路由器 v1.1 — 意图分类 + 模型路由 + 思考强度"""
from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum


class Intent(str, Enum):
    REWRITE = "rewrite"
    TITLE = "title"
    EXPLAIN = "explain"
    DERIVE = "derive"
    DESIGN = "design"
    JSON_FIX = "json_fix"
    FACT_QA = "fact_qa"


@dataclass
class RouteDecision:
    model: str
    reasoning_effort: str  # none | low | medium | high | xhigh
    max_tokens: int


# ── 意图分类正则 ──────────────────────────────
DERIVE_RE = re.compile(r"(推导|证明|为什么|怎么得到|求解|计算|公式来源)")
DESIGN_RE = re.compile(r"(思考题|综合|设计|分析|对比|方案)")


def classify_intent(
    user_msg: str,
    *,
    force_pro: bool = False,
    rag_hits: int = 0,
) -> Intent:
    """根据用户消息特征 + 上下文信号判断意图。"""
    if force_pro and DESIGN_RE.search(user_msg):
        return Intent.DESIGN
    if force_pro or DERIVE_RE.search(user_msg):
        return Intent.DERIVE
    if DESIGN_RE.search(user_msg):
        return Intent.DESIGN
    if rag_hits >= 3:
        return Intent.FACT_QA
    return Intent.EXPLAIN


# ── 路由表 ────────────────────────────────────
ROUTE_TABLE: dict[Intent, RouteDecision] = {
    Intent.REWRITE:  RouteDecision("deepseek-v4-flash", "none",    256),
    Intent.TITLE:    RouteDecision("deepseek-v4-flash", "none",    64),
    Intent.JSON_FIX: RouteDecision("deepseek-v4-flash", "none",    2000),
    Intent.FACT_QA:  RouteDecision("deepseek-v4-flash", "low",     3000),
    Intent.EXPLAIN:  RouteDecision("deepseek-v4-flash", "medium",  4000),
    Intent.DERIVE:   RouteDecision("deepseek-v4-pro",   "high",    8000),
    Intent.DESIGN:   RouteDecision("deepseek-v4-pro",   "xhigh",   12000),
}


def route(intent: Intent) -> RouteDecision:
    return ROUTE_TABLE[intent]
