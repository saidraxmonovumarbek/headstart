"use client";

import { useState } from "react";
import { useEffect } from "react";
import { BookOpen, Headphones } from "lucide-react";

type Props = {
  onClose: () => void;
  onCreated: (id: string) => void;
  initialData?: any;
};

export default function CreatePracticeTestModal({
  onClose,
  onCreated,
  initialData,
}: Props) {
  const [step, setStep] = useState(1);

  const [type, setType] = useState<"reading" | "listening" | null>(null);
  const [section, setSection] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [duration, setDuration] = useState(20);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const [paragraphs, setParagraphs] = useState<string[]>([""]);

  const [questionType, setQuestionType] = useState("");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [questions, setQuestions] = useState<
    Record<number, { q: string; a: string }>
  >({});

  const questionCount =
  section === "section1" || section === "section2"
    ? 13
    : section === "section3"
    ? 14
    : section === "section4"
    ? 10
    : 40;

      // ⭐ PREFILL WHEN EDITING
useEffect(() => {
  if (!initialData) return;

  setTitle(initialData.title || "");
  setDifficulty(initialData.difficulty || "medium");
  setDuration(initialData.duration || 20);
  setType(initialData.type || "reading");
  setSection(initialData.section || null);

  if (initialData.content) {
    setSubtitle(initialData.content.subtitle || "");
    setParagraphs(initialData.content.paragraphs || [""]);
    setQuestionType(initialData.content.questionType || "");
    setQuestions(initialData.content.questions || {});

    if (initialData.content.questions) {
      const nums = Object.keys(initialData.content.questions).map(Number);
      setSelectedNumbers(nums);
    }
  }
}, [initialData]);

  function autoDuration(s: string) {
  if (s === "section1" || s === "section2" || s === "section3" || s === "section4")
    return 20;
  return 60;
}

  function toggleNumber(n: number) {
    setSelectedNumbers((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  }

  function updateParagraph(i: number, value: string) {
    const copy = [...paragraphs];
    copy[i] = value;
    setParagraphs(copy);
  }

  function addParagraph() {
    setParagraphs((p) => [...p, ""]);
  }

  function updateQuestion(n: number, field: "q" | "a", value: string) {
    setQuestions((prev) => ({
      ...prev,
      [n]: { ...prev[n], [field]: value },
    }));
  }

  async function finish() {
  const method = initialData ? "PUT" : "POST";
  const url = initialData
    ? `/api/practice-tests/${initialData.id}`
    : "/api/practice-tests";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
  title,
  type,
  section,   // ⭐ ADD THIS
  difficulty,
  duration,
  content: {
        subtitle,
        paragraphs,
        questionType,
        questions,
      },
    }),
  });

  const data = await res.json();

  onCreated(data.id);
onClose();   // ⭐ close modal after save
}

function sectionLabel(s: string) {
  if (type === "reading") {
    if (s === "full") return "Full Reading Test";
    return `Passage ${s.replace("section", "")}`;
  }

  if (type === "listening") {
    if (s === "full") return "Full Listening Test";
    return `Part ${s.replace("section", "")}`;
  }

  return s;
}

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-2xl p-6 w-[760px] max-h-[90vh] overflow-y-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="flex justify-between items-center">
  <h2 className="text-xl font-bold">
    {initialData ? "Edit Test" : "Create Reading Test"}
  </h2>

  <button
    onClick={onClose}
    className="px-3 py-1 border rounded-lg text-sm"
  >
    Back
  </button>
</div>

            <div className="flex gap-3">
  <button
    className={`flex items-center gap-2 border px-4 py-2 rounded ${
      type === "reading" && "bg-green-100"
    }`}
    onClick={() => {
      setType("reading");
      setSection(null);
    }}
  >
    <BookOpen size={18} />
    Reading
  </button>

  <button
    className={`flex items-center gap-2 border px-4 py-2 rounded ${
      type === "listening" && "bg-green-100"
    }`}
    onClick={() => {
      setType("listening");
      setSection(null);
    }}
  >
    <Headphones size={18} />
    Listening
  </button>
</div>

            {type && (
  <div className="flex gap-3">
    {(type === "reading"
      ? ["section1", "section2", "section3", "full"]
      : ["section1", "section2", "section3", "section4", "full"]
    ).map((s) => (
      <button
        key={s}
        onClick={() => {
          setSection(s);
          setDuration(autoDuration(s));
        }}
        className={`border px-4 py-2 rounded ${
          section === s && "bg-green-100"
        }`}
      >
        {sectionLabel(s)}
      </button>
    ))}
  </div>
)}

            {section && (
              <div className="flex gap-3">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="border p-2 rounded"
                />

                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option>easy</option>
                  <option>medium</option>
                  <option>hard</option>
                </select>
              </div>
            )}

            <button
              disabled={!type || !section}
              onClick={() => setStep(2)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold">
  {initialData ? "Edit Passage" : "Passage Builder"}
</h2>

            <input
              placeholder="Title"
              className="border p-2 rounded w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              placeholder="Subtitle (optional)"
              className="border p-2 rounded w-full italic"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />

            {paragraphs.map((p, i) => (
              <textarea
                key={i}
                className="border p-2 rounded w-full"
                rows={4}
                value={p}
                onChange={(e) => updateParagraph(i, e.target.value)}
              />
            ))}

            <button onClick={addParagraph} className="border px-4 py-2 rounded">
              Add Paragraph
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="border px-4 py-2 rounded"
              >
                Back
              </button>

              <button
                onClick={() => setStep(3)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold">
  {initialData ? "Edit Questions" : "Questions Builder"}
</h2>

            <select
  value={questionType}
  onChange={(e) => setQuestionType(e.target.value)}
  className="border p-2 rounded"
>
  <option value="">Select type</option>

  <option value="truefalse">True / False / Not Given</option>
  <option value="yesno">Yes / No / Not Given</option>

  <option value="multiple">Multiple Choice</option>

  <option value="matching-headings">Matching Headings</option>
  <option value="matching-info">Matching Information</option>
  <option value="matching-features">Matching Features</option>
  <option value="matching-sentence">Matching Sentence Endings</option>

  <option value="summary">Summary Completion</option>
  <option value="sentence">Sentence Completion</option>
  <option value="table">Table Completion</option>
  <option value="flow">Flow Chart Completion</option>
  <option value="diagram">Diagram Label Completion</option>
  <option value="note">Note Completion</option>

  <option value="short">Short Answer Questions</option>
</select>

            <div className="flex flex-wrap gap-2">
              {Array.from({ length: questionCount }).map((_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    onClick={() => toggleNumber(n)}
                    className={`border px-2 py-1 rounded ${
                      selectedNumbers.includes(n) && "bg-green-100"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            {selectedNumbers.map((n) => (
              <div key={n} className="space-y-2 border p-3 rounded">
                <input
                  placeholder={`Question ${n}`}
                  className="border p-2 rounded w-full"
                  onChange={(e) => updateQuestion(n, "q", e.target.value)}
                />

                <input
                  placeholder="Answer"
                  className="border p-2 rounded w-full"
                  onChange={(e) => updateQuestion(n, "a", e.target.value)}
                />
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="border px-4 py-2 rounded"
              >
                Back
              </button>

              <button
                onClick={finish}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Finish
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}