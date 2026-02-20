"use client";

import { useEffect } from "react";

export function useAudioSync(audioRef: any, timestamps: any[]) {
  useEffect(() => {
    if (!audioRef.current) return;

    const interval = setInterval(() => {
      const time = audioRef.current.currentTime;

      timestamps.forEach((t) => {
        if (Math.abs(t.time - time) < 0.5) {
          const el = document.getElementById(t.anchor);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, [audioRef, timestamps]);
}