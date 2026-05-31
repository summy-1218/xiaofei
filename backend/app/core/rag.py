"""RAG 知识检索 — demo 优先使用本地课程资料兜底。"""
from __future__ import annotations

from app.core.config import settings
from app.services.course_data import search_course_context

try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings

    _client = chromadb.PersistentClient(
        path=settings.CHROMA_PERSIST_DIR,
        settings=ChromaSettings(anonymized_telemetry=False),
    )
except Exception:
    _client = None


def get_collection(course_id: str = "081"):
    """获取或创建课程的向量集合"""
    if _client is None:
        return None
    name = f"course_{course_id}"
    return _client.get_or_create_collection(
        name=name,
        metadata={"course_id": course_id},
    )


async def index_document(
    course_id: str,
    chapter_id: str,
    filename: str,
    content: str,
    metadata: dict | None = None,
):
    """将文档内容向量化并存入 ChromaDB"""
    from openai import AsyncOpenAI
    from app.core.config import settings as s

    collection = get_collection(course_id)
    if collection is None:
        return

    # 简易分块（按段落）
    chunks = [c.strip() for c in content.split("\n\n") if len(c.strip()) > 50]
    if not chunks:
        return

    # 批量嵌入
    client = AsyncOpenAI(api_key=s.OPENAI_API_KEY, base_url=s.OPENAI_BASE_URL or None)
    embeddings_resp = await client.embeddings.create(
        model=s.EMBEDDING_MODEL,
        input=chunks,
    )

    ids = [f"{chapter_id}_{i:04d}" for i in range(len(chunks))]
    metadatas = [
        {
            "course_id": course_id,
            "chapter_id": chapter_id,
            "filename": filename,
            "chunk_index": i,
            **(metadata or {}),
        }
        for i in range(len(chunks))
    ]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=[e.embedding for e in embeddings_resp.data],
        metadatas=metadatas,
    )


async def search_similar(
    query: str,
    course_id: str = "081",
    top_k: int = 5,
) -> list[dict]:
    """语义检索最相似的文档片段"""
    from openai import AsyncOpenAI
    from app.core.config import settings as s

    collection = get_collection(course_id)
    if collection is None:
        return []
    if collection.count() == 0:
        return []

    client = AsyncOpenAI(api_key=s.OPENAI_API_KEY, base_url=s.OPENAI_BASE_URL or None)
    query_embedding = await client.embeddings.create(
        model=s.EMBEDDING_MODEL,
        input=[query],
    )

    results = collection.query(
        query_embeddings=[query_embedding.data[0].embedding],
        n_results=top_k,
    )

    documents = []
    if results["documents"] and results["documents"][0]:
        for i, doc in enumerate(results["documents"][0]):
            meta = results["metadatas"][0][i] if results["metadatas"] else {}
            documents.append({"content": doc, "metadata": meta, "score": 1 - (results["distances"][0][i] if results["distances"] else 0)})

    return documents


async def build_context(query: str, course_id: str = "081") -> str:
    """为 LLM 构建 RAG 上下文"""
    docs = await search_similar(query, course_id)
    if not docs:
        items = search_course_context(query)
        return "\n\n---\n\n".join(
            f"[来源 {i + 1}] {item['source']}\n{item['summary']}"
            for i, item in enumerate(items)
        )

    parts = []
    for i, doc in enumerate(docs):
        meta = doc["metadata"]
        parts.append(
            f"[来源 {i+1}] {meta.get('filename', '未知')} "
            f"第{meta.get('chunk_index', 0)}段\n{doc['content']}"
        )
    return "\n\n---\n\n".join(parts)
