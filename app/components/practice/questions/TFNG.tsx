"use client";

const options = ["TRUE", "FALSE", "NOT GIVEN"];

export default function TFNG({ question, answer, setAnswer }: any) {
  return (
    <div>
      <p className="font-medium mb-2">{question.text}</p>

      {options.map((opt) => (
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