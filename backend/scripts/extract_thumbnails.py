"""提取每个课件 PDF 首页作为缩略图"""
import fitz  # PyMuPDF
from pathlib import Path

COURSEWARE_DIR = Path(__file__).resolve().parents[2] / "data" / "courseware" / "飞行原理"
THUMBS_DIR = Path(__file__).resolve().parents[2] / "data" / "thumbnails"

THUMBS_DIR.mkdir(parents=True, exist_ok=True)

pdfs = sorted(COURSEWARE_DIR.glob("*.pdf"))
print(f"Found {len(pdfs)} PDFs")

for i, pdf_path in enumerate(pdfs, 1):
    thumb_path = THUMBS_DIR / f"{i}.png"
    if thumb_path.exists():
        print(f"  [{i}/{len(pdfs)}] skip (exists): {pdf_path.name}")
        continue

    try:
        doc = fitz.open(str(pdf_path))
        page = doc[0]  # 首页
        pix = page.get_pixmap(dpi=150)
        pix.save(str(thumb_path))
        doc.close()
        print(f"  [{i}/{len(pdfs)}] OK: {pdf_path.name} → {i}.png ({pix.width}x{pix.height})")
    except Exception as e:
        print(f"  [{i}/{len(pdfs)}] FAIL: {pdf_path.name} — {e}")

print(f"Done. Thumbnails saved to {THUMBS_DIR}")
