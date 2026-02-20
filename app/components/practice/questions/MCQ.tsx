"use client";

export default function MCQ({ question, answer, setAnswer }: any) {
  return (
    <div>
      <p className="font-medium mb-2">{question.text}</p>

      {question.options.map((opt: string) => (
        <label key={opt} className="block">
          <input
            type="radio"
            checked={answer === opt}
            onChange={() => setAnswer(question.id, opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}