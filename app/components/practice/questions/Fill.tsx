"use client";

export default function Fill({ question, answer, setAnswer }: any) {
  return (
    <div>
      <p className="font-medium mb-2">{question.text}</p>

      <input
        className="border p-2 rounded"
        value={answer || ""}
        onChange={(e) => setAnswer(question.id, e.target.value)}
      />
    </div>
  );
}