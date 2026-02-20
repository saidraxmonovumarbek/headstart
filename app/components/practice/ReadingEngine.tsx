"use client";

import HighlightSystem from "./HighlightSystem";

export default function ReadingEngine({ section }: any) {
  return (
    <div className="flex h-full">
      {/* PASSAGE */}
      <div
        id="reading-passage"
        className="w-1/2 overflow-y-auto p-6 border-r"
        dangerouslySetInnerHTML={{ __html: section.content.passage }}
      />

      {/* QUESTIONS */}
      <div className="w-1/2 overflow-y-auto p-6">
        {section.content.questions.map((q: any) => (
          <div key={q.id} className="mb-6">
            <p className="font-semibold">{q.text}</p>
          </div>
        ))}
      </div>

      <HighlightSystem containerId="reading-passage" />
    </div>
  );
}