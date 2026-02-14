"use client";

import { useEffect, useState } from "react";

export default function ReflectionBox({
  selectedDate,
}: {
  selectedDate: any;
}) {
  const REFLECTION_WORD_LIMIT = 100;

  const [reflection, setReflection] = useState("");
  const [reflectionWords, setReflectionWords] = useState(0);
  const [reflectionDate, setReflectionDate] = useState(
    selectedDate.format("YYYY-MM-DD")
  );

  useEffect(() => {
    const dateKey = selectedDate.format("YYYY-MM-DD");
    setReflectionDate(dateKey);

    async function loadReflection() {
      const res = await fetch(`/api/reflection?date=${dateKey}`);
      if (!res.ok) {
        setReflection("");
        setReflectionWords(0);
        return;
      }

      const data = await res.json();
      const content = data?.content || "";

      setReflection(content);
      setReflectionWords(countWords(content));
    }

    loadReflection();
  }, [selectedDate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: reflectionDate,
          content: reflection,
        }),
      }).catch(() => {});
    }, 600);

    return () => clearTimeout(timeout);
  }, [reflection, reflectionDate]);

  function countWords(text: string) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">
        Reflect on {selectedDate.format("MMMM D")}
      </h3>

      <textarea
        value={reflection}
        onChange={(e) => {
          const text = e.target.value;
          const words = countWords(text);

          if (words <= REFLECTION_WORD_LIMIT) {
            setReflection(text);
            setReflectionWords(words);
          }
        }}
        className="w-full min-h-[100px] rounded-xl p-3 text-sm text-black resize-none outline-none"
        placeholder="Briefly reflect on your day..."
      />

      <div className="text-xs mt-1 opacity-70 text-right">
        {reflectionWords} / {REFLECTION_WORD_LIMIT} words
      </div>
    </div>
  );
}