"""小飞 AI 智能助手 — FastAPI 主入口"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, chat, quiz, materials, forum, analytics

app = FastAPI(
    title="小飞 AI 智能助手 API",
    description="面向飞行技术专业学员的智能学习平台后端",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])
app.include_router(materials.router, prefix="/api/materials", tags=["Materials"])
app.include_router(forum.router, prefix="/api/forum", tags=["Forum"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}
