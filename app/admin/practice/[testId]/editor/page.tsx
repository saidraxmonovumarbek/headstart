"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PracticeEditor() {
  const params = useParams();
  const testId = params?.testId as string;

  const [sections, setSections] = useState<any[]>([]);

  async function fetchTest() {
    if (!testId) return;

    const res = await fetch(`/api/practice-tests/${testId}`);
    const data = await res.json();
    setSections(data.sections || []);
  }

  useEffect(() => {
    fetchTest();
  }, [testId]);

  async function addSection() {
    await fetch("/api/practice-sections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        testId,
        title: "New Section",
        order: sections.length,
      }),
    });

    fetchTest();
  }

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-bold">Practice Editor</h1>

      <button
        onClick={addSection}
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        Add Section
      </button>

      <div className="space-y-3">
        {sections.map((s) => (
          <div key={s.id} className="border p-4 rounded-lg bg-white">
            {s.title}
          </div>
        ))}
      </div>
    </div>
  );
}