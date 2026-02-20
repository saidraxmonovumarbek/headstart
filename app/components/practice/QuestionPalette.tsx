"use client";

export default function QuestionPalette({
  questions,
  answers,
  active,
  onSelect,
}: any) {
  return (
    <div className="flex gap-2 flex-wrap p-4 border-t">
      {questions.map((q: any, i: number) => {
        const answered = answers[q.id];

        return (
          <button
            key={q.id}
            onClick={() => onSelect(q.id)}
            className={`w-8 h-8 rounded-full text-sm
              ${active === q.id ? "bg-black text-white" : ""}
              ${answered ? "bg-green-500 text-white" : "bg-gray-200"}
            `}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}