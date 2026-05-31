// API 客户端
// 封装与 FastAPI 后端的通信

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Network error" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Auth ─────────────────────────────────────
export const auth = {
  login: (studentId: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, password }),
    }),
};

// ── Chat ─────────────────────────────────────
export const chat = {
  send: (threadId: string, message: string, forcePro = false) =>
    request<{ thread_id: string; reply: ChatMessage }>("/chat/send", {
      method: "POST",
      body: JSON.stringify({ thread_id: threadId, message, force_pro: forcePro }),
    }),
  getSessions: () => request<ChatSession[]>("/chat/sessions"),
  getMessages: (sessionId: string) =>
    request<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`),
};

// ── Quiz ─────────────────────────────────────
export const quiz = {
  getChapters: (courseId?: string) =>
    request<Chapter[]>(`/quiz/chapters${courseId ? `?course_id=${courseId}` : ""}`),
  startPractice: (params: PracticeParams) =>
    request<{ questions: Question[] }>("/quiz/practice", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  submitAnswer: (questionId: string, answer: string) =>
    request<{ is_correct: boolean; explanation: string; correct_answer?: string }>("/quiz/submit", {
      method: "POST",
      body: JSON.stringify({ question_id: questionId, answer }),
    }),
  getWrongBook: () => request<Question[]>("/quiz/wrong-book"),
  getStats: (courseCode = "081") => request<StatItem[]>(`/quiz/stats?course_code=${courseCode}`),
  getQuick: (courseCode = "081") => request<QuickData>(`/quiz/quick?course_code=${courseCode}`),
};

// ── Materials ────────────────────────────────
export const materials = {
  list: (courseId?: string) =>
    request<Material[]>("/materials/list", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId }),
    }),
  getDownloadUrl: (materialId: string) =>
    `${API_BASE}/materials/download/${materialId}`,
};

// ── Forum ────────────────────────────────────
export const forum = {
  listPosts: (chapterId?: string) =>
    request<ForumPost[]>(`/forum/posts${chapterId ? `?chapter_id=${chapterId}` : ""}`),
  getPost: (postId: number) => request<ForumPost>(`/forum/posts/${postId}`),
  createPost: (data: CreatePostData) =>
    request<ForumPost>("/forum/posts", { method: "POST", body: JSON.stringify(data) }),
  reply: (postId: number, content: string) =>
    request<ForumReply>(`/forum/posts/${postId}/replies`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};

// ── Analytics ────────────────────────────────
export const analytics = {
  getOverview: () => request<UserStats>("/analytics/overview"),
  getKnowledgeMap: () => request<KnowledgeMapData>("/analytics/knowledge-map"),
};

// ── Types ────────────────────────────────────
export interface User {
  id: string;
  student_id: string;
  name: string;
  cohort: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
  message_count: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: { source: string; page: number }[];
  created_at: string;
}

export interface Chapter {
  id: string;
  course_id: string;
  name: string;
  en_name: string;
  question_count: number;
}

export interface PracticeParams {
  mode: "chapter" | "all" | "random" | "challenge";
  chapter_id?: string;
  chapter_ids?: string[];
  count: number;
}

export interface Question {
  id: string;
  course_id: string;
  chapter_id: string;
  type: string;
  difficulty: number;
  title: string;
  options: Record<string, string>;
  img?: string;
  ans_img?: string;
}

export interface Material {
  id: string;
  course_id: string;
  chapter: string;
  title: string;
  filename: string;
  size: string;
  description: string;
}

export interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: string;
  role: "student" | "teacher";
  time: string;
  replies: number;
  views: number;
  chapter_id: string;
}

export interface ForumReply {
  author: string;
  role: "student" | "teacher";
  time: string;
  content: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  chapter_id?: string;
}

export interface UserStats {
  total_answered: number;
  total_correct: number;
  accuracy: number;
  streak_days: number;
  study_minutes_today: number;
  chapter_progress: { chapter_id: string; name: string; progress: number }[];
}

export interface StatItem {
  key: string;
  label: string;
  value: string;
  delta?: { value: number; positive: boolean };
}

export interface QuickData {
  resume: { sessionId: string; chapterTitle: string; cursor: number; total: number; accuracy: number } | null;
  wrongCount: number;
  favCount: number;
  mockReady: boolean;
}

export interface KnowledgeMapData {
  nodes: { id: string; name: string; mastery: number }[];
  edges: { source: string; target: string; relation: string }[];
}
