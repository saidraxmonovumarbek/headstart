"use client";

import { useEffect, useState } from "react";

export default function HighlightSystem({
  containerId,
}: {
  containerId: string;
}) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = document.getElementById(containerId);

    function handleSelection() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setShow(false);
        return;
      }

      const rect = sel.getRangeAt(0).getBoundingClientRect();

      setPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 40,
      });

      setShow(true);
    }

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, [containerId]);

  function highlight() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const mark = document.createElement("mark");
    mark.style.background = "yellow";

    range.surroundContents(mark);
    sel.removeAllRanges();
    setShow(false);
  }

  if (!show) return null;

  return (
    <button
      style={{
        position: "fixed",
        top: pos.y,
        left: pos.x,
      }}
      className="bg-yellow-400 px-3 py-1 rounded shadow text-sm"
      onClick={highlight}
    >
      Highlight
    </button>
  );
}