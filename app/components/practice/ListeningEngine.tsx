"use client";

export default function ListeningEngine({
  section,
  answers,
  setAnswer,
}: any) {
  return (
    <div className="p-6">
      <audio
        controls
        src={section.content.audioUrl}
        className="w-full mb-6"
      />

      {section.content.questions.map((q: any) => (
        <div key={q.id} className="mb-4">
          <p className="mb-2">{q.text}</p>

          <input
            value={answers[q.id] || ""}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      ))}
    </div>
  );
}