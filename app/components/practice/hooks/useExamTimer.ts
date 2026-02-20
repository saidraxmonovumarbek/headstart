"use client";

import { useEffect, useState } from "react";

export function useExamTimer(durationMinutes: number) {
  const [seconds, setSeconds] = useState(0);

  // sync with duration
  useEffect(() => {
    setSeconds(durationMinutes * 60);
  }, [durationMinutes]);

  // countdown
  useEffect(() => {
    if (!seconds) return;

    const id = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [seconds]);

  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return {
    seconds,
    formatted: `${min}:${sec.toString().padStart(2, "0")}`,
    finished: seconds === 0,
  };
}