"""认证 API"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class LoginRequest(BaseModel):
    student_id: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: dict


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    """学号+密码登录"""
    # TODO: Phase 1 W2 — 从数据库验证用户
    if req.student_id == "test" and req.password == "test":
        user = {"id": "mock-uuid", "student_id": req.student_id, "name": "测试用户", "cohort": "2025"}
        token = _create_token(user["id"])
        return LoginResponse(token=token, user=user)
    raise HTTPException(status_code=401, detail="学号或密码错误")


def _create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
