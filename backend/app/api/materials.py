"""课程资料 API v1.2 — 资源概览 + 标签 + PPT列表"""
from __future__ import annotations

import random
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from app.services.course_data import get_material, list_materials as load_materials

router = APIRouter()


class ListRequest(BaseModel):
    course_id: str | None = None


# ── 缩略图 ──────────────────────────────────
THUMBS_DIR = Path(__file__).resolve().parents[3] / "data" / "thumbnails"


@router.get("/thumbnail/{material_id}")
async def get_thumbnail(material_id: str):
    """获取课件首页缩略图"""
    thumb_path = THUMBS_DIR / f"{material_id}.png"
    if not thumb_path.exists():
        raise HTTPException(status_code=404, detail="缩略图未找到")
    return FileResponse(str(thumb_path), media_type="image/png")


# ── 资源概览 ──────────────────────────────────
@router.get("/overview")
async def get_overview(course_code: str = "081"):
    """资源概览 KPI 条"""
    mats = load_materials()
    ppt_count = sum(1 for m in mats if m.get("type", "ppt") != "reading")
    reading_count = sum(1 for m in mats if m.get("type") == "reading")
    total_bytes = 0
    for m in mats:
        import os
        path = m.get("path", "")
        if os.path.exists(path):
            total_bytes += os.path.getsize(path)

    gb = total_bytes / (1024 ** 3)
    total_size = f"{gb:.1f} GB" if gb >= 0.1 else f"{total_bytes / (1024**2):.0f} MB"

    return {
        "pptCount": ppt_count,
        "videoCount": 0,
        "readingCount": reading_count,
        "totalSize": total_size,
        "weekNew": random.randint(0, 3),
    }


# ── Tag 字典 ──────────────────────────────────
@router.get("/tags")
async def get_tags(course_code: str = "081"):
    """课件标签列表（章节分类）"""
    return [
        "飞机与大气", "空气动力学基础", "高速空气动力学",
        "螺旋桨空气动力学", "稳定性与操纵性", "飞行性能", "特殊飞行条件",
    ]


# ── PPT 列表（网格/列表双模式） ────────────────
@router.get("/ppt")
async def list_ppt(
    course_code: str = "081",
    tag: str = "",
    q: str = "",
    sort: str = "chapter",
):
    """PPT 课件列表（含缩略图 fallback）"""
    mats = [m for m in load_materials() if m.get("type", "ppt") != "reading"]
    result = []
    for m in mats:
        # 标签筛选
        if tag and m.get("chapter", "") != tag:
            continue
        # 搜索
        if q and q.lower() not in m.get("title", "").lower() and q.lower() not in m.get("filename", "").lower():
            continue

        result.append({
            "id": m["id"],
            "title": m["title"],
            "description": m.get("description", ""),
            "fileName": m["filename"],
            "fileSize": m["size"],
            "tag": m.get("chapter", "飞行原理"),
            "thumbnailUrl": f"/api/materials/thumbnail/{m['id']}",
            "pages": random.randint(20, 80),
            "uploadedAt": "2025-03",
            "viewCount": random.randint(10, 300),
            "downloadCount": random.randint(5, 150),
            "favorited": False,
        })

    # 排序
    if sort == "newest":
        result.sort(key=lambda x: x["uploadedAt"], reverse=True)
    elif sort == "size":
        result.sort(key=lambda x: float(x["fileSize"].replace(" MB", "").replace(" KB", "")), reverse=True)
    elif sort == "popular":
        result.sort(key=lambda x: x["viewCount"], reverse=True)

    return result


# ── 视频列表（预留，返回空） ──────────────────
@router.get("/video")
async def list_video(course_code: str = "081"):
    """视频素材列表（预留）"""
    return []


# ── 补充读物列表 ────────────────────────────
@router.get("/reading")
async def list_reading(course_code: str = "081"):
    """补充读物列表"""
    mats = [m for m in load_materials() if m.get("type") == "reading"]
    result = []
    for m in mats:
        result.append({
            "id": m["id"],
            "title": m["title"],
            "description": m.get("description", ""),
            "fileName": m["filename"],
            "fileSize": m["size"],
            "tag": "补充读物",
            "thumbnailUrl": f"/api/materials/thumbnail/{m['id']}",
            "pages": 0,
            "uploadedAt": "2025",
            "viewCount": 0,
            "downloadCount": 0,
            "favorited": False,
        })
    return result


# ── 文件下载/预览 ────────────────────────────
@router.get("/download/{material_id}")
async def download_material(material_id: str, inline: bool = False):
    """下载或预览课件 PDF"""
    material = get_material(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="课件未找到")
    if inline:
        # inline 模式：显式设 Content-Disposition: inline 防止大文件触发下载
        from starlette.responses import Response
        content = Path(material["path"]).read_bytes()
        return Response(
            content=content,
            media_type="application/pdf",
            headers={"Content-Disposition": "inline"},
        )
    # download 模式：传 filename 触发下载
    return FileResponse(
        material["path"],
        media_type="application/pdf",
        filename=material["filename"],
    )


# ── 列表（兼容旧接口） ────────────────────────
@router.post("/list")
async def list_materials(req: ListRequest):
    """获取课件资料列表（兼容旧版）"""
    return [
        {key: value for key, value in item.items() if key != "path"}
        for item in load_materials()
    ]
