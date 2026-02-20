"use client";

import { useState } from "react";

export default function CreatePracticeTestModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("reading");
  const [difficulty, setDifficulty] = useState("medium");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);

  async function createTest() {
    if (!title.trim()) return;

    setLoading(true);

    const res = await fetch("/api/practice-tests", {
      method: "POST",
      body: JSON.stringify({ title, type, difficulty, duration }),
    });

    const data = await res.json();

    setLoading(false);
    onCreated(data.id);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-[420px] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">Create Practice Test</h2>

        <input
          placeholder="Title"
          className="w-full border p-2 rounded-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="w-full border p-2 rounded-lg"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="reading">Reading</option>
          <option value="listening">Listening</option>
        </select>

        <select
          className="w-full border p-2 rounded-lg"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <input
          type="number"
          className="w-full border p-2 rounded-lg"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={createTest}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}