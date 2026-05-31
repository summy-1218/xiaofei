"use client";

import { create } from "zustand";
import type { Question } from "@/lib/api";

interface QuizSessionState {
  questions: Question[];
  currentIndex: number;
  answers: Record<number, string>;  // index → selected option
  submitted: Record<number, boolean>;
  score: number;
  mode: string;

  loadQuestions: (qs: Question[], mode: string) => void;
  selectAnswer: (index: number, option: string) => void;
  submitAnswer: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  reset: () => void;
}

export const useQuizSessionStore = create<QuizSessionState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: {},
  submitted: {},
  score: 0,
  mode: "",

  loadQuestions: (qs, mode) =>
    set({
      questions: qs,
      currentIndex: 0,
      answers: {},
      submitted: {},
      score: 0,
      mode,
    }),

  selectAnswer: (index, option) =>
    set((s) => {
      if (s.submitted[index]) return s;
      return { answers: { ...s.answers, [index]: option } };
    }),

  submitAnswer: (index) => {
    const state = get();
    if (state.submitted[index]) return;
    const userAns = state.answers[index] || "";
    const q = state.questions[index];
    const correct = userAns === (q as any).correct;
    set((s) => ({
      submitted: { ...s.submitted, [index]: true },
      score: correct ? s.score + 1 : s.score,
    }));
  },

  nextQuestion: () =>
    set((s) => ({
      currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1),
    })),

  prevQuestion: () =>
    set((s) => ({
      currentIndex: Math.max(s.currentIndex - 1, 0),
    })),

  reset: () =>
    set({
      questions: [],
      currentIndex: 0,
      answers: {},
      submitted: {},
      score: 0,
      mode: "",
    }),
}));
