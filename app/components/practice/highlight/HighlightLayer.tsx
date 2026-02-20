"use client";

import { useEffect, useState } from "react";

export default function HighlightLayer({
  children,
  testId,
}: {
  children: React.ReactNode;
  testId: string;
}) {
  const [popup, setPopup] = useState<{ x: number; y: number } | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);

  function handleMouseUp(e: any) {
    const selection = window.getSelection()?.toString();
    if (!selection) return;

    setPopup({ x: e.clientX, y: e.clientY });
  }

  function applyHighlight() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const text = sel.toString();

    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.background = "yellow";

    range.surroundContents(span);

    // ⭐ store highlight
    setHighlights((prev) => [...prev, text]);

    setPopup(null);
  }

  /* ⭐ LOAD highlights */
  useEffect(() => {
    const saved = localStorage.getItem(`practice_${testId}_highlights`);
    if (saved) setHighlights(JSON.parse(saved));
  }, [testId]);

  /* ⭐ SAVE highlights */
  useEffect(() => {
    localStorage.setItem(
      `practice_${testId}_highlights`,
      JSON.stringify(highlights)
    );
  }, [highlights, testId]);

  return (
    <div onMouseUp={handleMouseUp} className="relative">
      {children}

      {popup && (
        <button
          style={{ left: popup.x, top: popup.y }}
          className="fixed bg-black text-white px-3 py-1 rounded text-xs z-50"
          onClick={applyHighlight}
        >
          Highlight
        </button>
      )}
    </div>
  );
}