"""数据库模型 — SQLAlchemy ORM"""
from sqlalchemy import (
    Column, String, Integer, Boolean, Text, Float,
    DateTime, ForeignKey, JSON, create_engine,
)
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid
from datetime import datetime


class Base(DeclarativeBase):
    pass


# ── 用户 ──────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(50), nullable=False)
    hashed_password = Column(String(128), nullable=False)
    cohort = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)


# ── 课程 / 章节 ───────────────────────────────
class Course(Base):
    __tablename__ = "courses"

    id = Column(String(20), primary_key=True)
    name = Column(String(100), nullable=False)
    en_name = Column(String(200))
    credits = Column(Integer)
    semester = Column(Integer)

    chapters = relationship("Chapter", back_populates="course")


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(String(20), primary_key=True)
    course_id = Column(String(20), ForeignKey("courses.id"), nullable=False)
    name = Column(String(100), nullable=False)
    en_name = Column(String(200))
    order_num = Column(Integer)

    course = relationship("Course", back_populates="chapters")


# ── 题目 ──────────────────────────────────────
class Question(Base):
    __tablename__ = "questions"

    id = Column(String(20), primary_key=True)
    course_id = Column(String(20), ForeignKey("courses.id"))
    chapter_id = Column(String(20), ForeignKey("chapters.id"))
    knowledge_point_ids = Column(ARRAY(String))
    type = Column(String(20), nullable=False)
    difficulty = Column(Integer)
    title = Column(Text, nullable=False)
    options = Column(JSON)
    correct_answer = Column(String(10))
    explanation = Column(Text)
    tags = Column(ARRAY(String))


# ── 答题记录 ──────────────────────────────────
class AnswerRecord(Base):
    __tablename__ = "answer_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    question_id = Column(String(20), ForeignKey("questions.id"), nullable=False)
    user_answer = Column(String(10))
    is_correct = Column(Boolean)
    time_spent = Column(Integer)  # seconds
    created_at = Column(DateTime, default=datetime.utcnow)


# ── 对话 ──────────────────────────────────────
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200))
    course_id = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

    messages = relationship("ChatMessage", back_populates="session", order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    citations = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")


# ── 社区 ──────────────────────────────────────
class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    chapter_id = Column(String(20))
    is_pinned = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    reply_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class ForumReply(Base):
    __tablename__ = "forum_replies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("forum_posts.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
