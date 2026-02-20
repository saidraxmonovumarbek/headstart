"use client";

import { useEffect, useState } from "react";

export function useAnswerStore(testId: string) {
  const key = `practice_answers_${testId}`;

  const [answers, setAnswers] = useState<Record<string, any>>({});

  // load saved answers
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) setAnswers(JSON.parse(saved));
  }, [key]);

  // autosave
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(answers));
  }, [answers, key]);

  function setAnswer(qId: string, value: any) {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }

  return { answers, setAnswer };
}