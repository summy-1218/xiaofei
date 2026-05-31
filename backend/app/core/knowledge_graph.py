"""知识图谱 — Neo4j 课程概念-公式-题目关联"""
from app.core.config import settings


async def get_driver():
    """获取 Neo4j 驱动（延迟导入）"""
    from neo4j import AsyncGraphDatabase
    return AsyncGraphDatabase.driver(
        settings.NEO4J_URI,
        auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD) if settings.NEO4J_PASSWORD else None,
    )


async def get_related_concepts(concept_name: str, depth: int = 2) -> list[dict]:
    """查询与某概念相关的知识点"""
    driver = await get_driver()
    async with driver.session() as session:
        result = await session.run("""
            MATCH (c:Concept {name: $name})-[r:RELATES_TO|PREREQUISITE_OF*1..%d]-(related:Concept)
            RETURN DISTINCT related.name AS name, type(r[0]) AS relation
            LIMIT 10
        """ % depth, name=concept_name)
        return [{"name": record["name"], "relation": record["relation"]} async for record in result]


async def get_concept_questions(concept_name: str, limit: int = 5) -> list[str]:
    """获取考察某知识点的题目ID列表"""
    driver = await get_driver()
    async with driver.session() as session:
        result = await session.run("""
            MATCH (c:Concept {name: $name})-[:TESTS]-(q:Question)
            RETURN q.id AS question_id
            LIMIT $limit
        """, name=concept_name, limit=limit)
        return [record["question_id"] async for record in result]


async def build_concept_graph(course_id: str):
    """为课程初始化知识图谱（批量导入概念和关系）"""
    # TODO: 从课程教学大纲批量构建知识图谱
    # Phase 2 W7 实现
    pass
