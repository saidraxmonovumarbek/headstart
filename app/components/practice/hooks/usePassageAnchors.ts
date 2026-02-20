"use client";

export function scrollToAnchor(anchorId: string) {
  const el = document.getElementById(anchorId);
  if (!el) return;

  el.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}