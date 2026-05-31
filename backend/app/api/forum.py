"""讨论社区 API v1.3 — 脉搏条 + 帖子流 + AI 助答"""
from __future__ import annotations

import random
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# ── Demo 帖子数据 ─────────────────────────────
DEMO_POSTS = [
    {
        "id": "1",
        "chapterCode": "081-03",
        "author": {"id": "u1", "name": "航宇小明", "avatarUrl": "", "role": "student"},
        "createdAt": "2026-05-30T09:20:00Z",
        "title": "临界攻角和失速速度到底谁决定谁？",
        "excerpt": "复习 2-6 时发现很多题把速度、重量、构型和攻角混在一起考，想请教如何建立判断顺序。",
        "content": "最近在复习 2-6 失速特性这一章，题库里有很多题目把飞行速度、飞机重量、襟翼构型和攻角混在一起考。\n\n我发现自己在判断「谁决定谁」的时候总是搞反。比如：\n\n- 是攻角决定失速，还是速度决定失速？\n- 重量增加 → 失速速度增加，那攻角在这个过程中怎么变？\n- 襟翼放下 → CLmax 增加 → 失速速度降低，攻角呢？\n\n希望有同学或老师能帮忙理清这个判断顺序，最好给一个做题时的思维框架。感谢！",
        "tags": ["失速", "临界攻角"],
        "replyCount": 5,
        "viewCount": 142,
        "upvoteCount": 12,
        "status": "open",
        "hot": True,
        "hasAiAnswer": True,
        "aiAnswerSnippet": "失速的核心判断顺序：先看攻角是否超临界（≈16°），再看速度和构型如何影响失速速度...",
        "aiCitations": [{"type": "ppt", "refId": "2-6", "label": "PPT 2-6 第12页"}],
        "bookmarked": False,
    },
    {
        "id": "2",
        "chapterCode": "081-04",
        "author": {"id": "u2", "name": "王老师", "avatarUrl": "", "role": "teacher"},
        "createdAt": "2026-05-29T18:40:00Z",
        "title": "重心前移为什么会增加杆力梯度？",
        "excerpt": "题库里多次出现 CG forward 与 stick force per g 的关系，求一个直观解释。",
        "content": "最近在备课时发现，很多学员对'重心前移 → 杆力梯度增加'这个结论只记住了结论，不理解原因。\n\n这里涉及几个概念：\n1. 纵向静稳定性（重心与焦点的相对位置）\n2. 杆力梯度（单位 g 载荷变化需要的杆力变化）\n3. 升降舵配平\n\n我打算在下次课上用一个具体算例演示，但想先在社区里听听其他教员有没有更好的教学方法？",
        "tags": ["稳定性", "重心", "杆力"],
        "replyCount": 8,
        "viewCount": 296,
        "upvoteCount": 24,
        "status": "solved",
        "hot": True,
        "hasAiAnswer": False,
        "bookmarked": True,
    },
    {
        "id": "3",
        "chapterCode": "081-01",
        "author": {"id": "u3", "name": "飞行新手", "avatarUrl": "", "role": "student"},
        "createdAt": "2026-05-31T10:15:00Z",
        "title": "伯努利方程中静压和动压的物理意义是什么？",
        "excerpt": "一直没搞明白 P 和 ½ρv² 分别代表什么，课本说总压恒定但感觉太抽象。",
        "tags": ["伯努利", "空气动力学"],
        "replyCount": 3,
        "viewCount": 88,
        "upvoteCount": 6,
        "status": "open",
        "hot": False,
        "hasAiAnswer": True,
        "aiAnswerSnippet": "静压 P 是流体分子热运动对壁面的碰撞力，动压 ½ρv² 是流体宏观动能在单位体积上的体现...",
        "aiCitations": [{"type": "ppt", "refId": "2-1", "label": "PPT 2-1 第8页"}],
        "bookmarked": False,
    },
    {
        "id": "4",
        "chapterCode": "081-06",
        "author": {"id": "u4", "name": "机长学员", "avatarUrl": "", "role": "student"},
        "createdAt": "2026-05-28T14:00:00Z",
        "title": "飞行包线里的机动速度 Va 到底怎么用？",
        "excerpt": "题目问在 turbulence 中应该飞什么速度，答案给 Va。但为什么不是 Vno？",
        "tags": ["飞行包线", "机动速度", "限制"],
        "replyCount": 2,
        "viewCount": 65,
        "upvoteCount": 4,
        "status": "open",
        "hot": False,
        "hasAiAnswer": False,
        "bookmarked": False,
    },
]


DEMO_REPLIES = {
    "1": [
        {"id": "r1", "author": {"name": "王老师", "role": "teacher"}, "createdAt": "2026-05-30 10:15", "content": "小明问得很好！关键要记住：**失速的本质是攻角超过临界值**。速度、重量、构型这些因素改变的是'在什么速度下会达到临界攻角'，而不是直接'导致'失速。\n\n做题框架：\n1. 先判断临界攻角是否被触及\n2. 再看题目问的是什么速度（CAS/TAS？Vs？）\n3. 用公式 Vs = √(2W/ρSCLmax) 判断各因素对失速速度的影响"},
        {"id": "r2", "author": {"name": "航宇达人", "role": "student"}, "createdAt": "2026-05-30 11:30", "content": "补充一个点：转弯时载荷因数 n > 1，失速速度会乘以 √n。这也是为什么盘旋时更容易失速——不是因为速度低，而是因为需要更大的 CL 来维持 L = nW。"},
        {"id": "r3", "author": {"name": "飞行新手", "role": "student"}, "createdAt": "2026-05-30 14:00", "content": "感谢老师和达人！我试着总结一下：\n\n- 攻角 = 根本原因（直接原因）\n- 速度/重量/构型 = 影响因素（改变失速发生的速度门槛）\n\n这样理解对吗？"},
        {"id": "r4", "author": {"name": "王老师", "role": "teacher"}, "createdAt": "2026-05-30 15:00", "content": "@飞行新手 完全正确！这个总结很精炼。"},
        {"id": "r5", "author": {"name": "航宇小明", "role": "student"}, "createdAt": "2026-05-30 16:00", "content": "谢谢大家！现在做题思路清晰多了。我还整理了一张思维导图，回头分享出来。"},
    ],
    "2": [
        {"id": "r6", "author": {"name": "王老师", "role": "teacher"}, "createdAt": "2026-05-29 19:00", "content": "重心前移会增加纵向静稳定性，这没错。但杆力梯度增加的原因是：重心前移 → 静稳定裕度增大 → 需要更大的升降舵偏转来改变同样的攻角 → 杆力增大。\n\n简单说：飞机更'稳'了，但也更'不愿意'改变姿态了。"},
        {"id": "r7", "author": {"name": "机长学员", "role": "student"}, "createdAt": "2026-05-29 20:30", "content": "实际飞行中的体验：重心靠前时，拉杆起飞需要更大的杆力，但巡航时更稳定。重心靠后则相反——杆力轻但容易飘。"},
    ],
    "3": [
        {"id": "r8", "author": {"name": "助教小李", "role": "ta"}, "createdAt": "2026-05-31 11:00", "content": "静压 P 可以理解为流体分子热运动对壁面的碰撞力，它是'潜在'的能量。动压 ½ρv² 可以理解为流体宏观动能在单位体积上的体现，是'运动'的能量。\n\n伯努利方程 P + ½ρv² = 常数，本质上就是：在无黏不可压定常流动中，单位体积流体的总机械能守恒。"},
        {"id": "r9", "author": {"name": "飞行新手", "role": "student"}, "createdAt": "2026-05-31 14:00", "content": "这样解释就很清楚了！所以总压 = 静压 + 动压，如果速度增大（动压增大），静压就必须减小来保持总压恒定。这就是机翼上表面产生低压的原理。"},
    ],
}

class CreatePostRequest(BaseModel):
    title: str
    content: str
    tags: list[str] = []
    wantAiAnswer: bool = True


# ── 帖子详情 ──────────────────────────────────
@router.get("/posts/{post_id}")
async def get_post_detail(post_id: str):
    post = next((p for p in DEMO_POSTS if p["id"] == post_id), None)
    if not post:
        return {"error": "帖子不存在"}
    replies = DEMO_REPLIES.get(post_id, [])
    return {**post, "content": post.get("content", post["excerpt"]), "replies": replies}


# ── 社区脉搏 ──────────────────────────────────
@router.get("/pulse")
async def get_pulse(course_code: str = "081"):
    return {
        "totalPosts": len(DEMO_POSTS),
        "solvedRate": 25,
        "todayNew": random.randint(0, 3),
        "myPending": random.randint(0, 2),
    }


# ── 章节列表 ──────────────────────────────────
@router.get("/chapters")
async def list_community_chapters(course_code: str = "081"):
    chapters = set(p["chapterCode"] for p in DEMO_POSTS)
    return [{"code": c, "title": c} for c in sorted(chapters)]


# ── 帖子列表 ──────────────────────────────────
@router.get("/posts")
async def list_posts(
    course_code: str = "081",
    view: str = "latest",
    chapter: str = "",
    status: str = "",
    sort: str = "latest",
    q: str = "",
):
    posts = DEMO_POSTS.copy()

    if chapter:
        posts = [p for p in posts if p["chapterCode"] == chapter]
    if status:
        filters = status.split(",")
        posts = [p for p in posts if any(
            (s == "未解答" and p["status"] == "open") or
            (s == "已解决" and p["status"] == "solved") or
            (s == "有 AI 答案" and p["hasAiAnswer"])
            for s in filters
        )]
    if q:
        ql = q.lower()
        posts = [p for p in posts if ql in p["title"].lower() or ql in p["excerpt"].lower()]

    if view == "hot":
        posts.sort(key=lambda p: p["upvoteCount"] + p["replyCount"], reverse=True)
    elif view == "unsolved":
        posts = [p for p in posts if p["status"] == "open"]
    elif sort == "replies":
        posts.sort(key=lambda p: p["replyCount"], reverse=True)
    elif sort == "views":
        posts.sort(key=lambda p: p["viewCount"], reverse=True)
    elif sort == "votes":
        posts.sort(key=lambda p: p["upvoteCount"], reverse=True)

    return posts


# ── 发帖 ──────────────────────────────────────
@router.post("/posts")
async def create_post(req: CreatePostRequest):
    new_id = str(len(DEMO_POSTS) + 1)
    post = {
        "id": new_id,
        "chapterCode": req.chapterCode or "081-01",
        "author": {"id": "u0", "name": "当前用户", "avatarUrl": "", "role": "student"},
        "createdAt": "刚刚",
        "title": req.title,
        "excerpt": req.content[:150],
        "tags": req.tags,
        "replyCount": 0,
        "viewCount": 1,
        "upvoteCount": 0,
        "status": "open",
        "hot": False,
        "hasAiAnswer": False,
        "bookmarked": False,
    }
    DEMO_POSTS.insert(0, post)
    return post


# ── 回复 ──────────────────────────────────────
class CreateReplyRequest(BaseModel):
    content: str

@router.post("/posts/{post_id}/replies")
async def create_reply(post_id: int, req: CreateReplyRequest):
    return {"author": "演示用户", "role": "student", "time": "刚刚", "content": req.content}
