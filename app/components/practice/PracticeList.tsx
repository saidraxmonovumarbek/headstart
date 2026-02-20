"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CreatePracticeTestModal from "@/app/admin/practice/components/CreatePracticeTestModal";

function difficultyColor(d: string) {
  if (d === "easy") return "text-green-600";
  if (d === "medium") return "text-orange-500";
  if (d === "hard") return "text-red-500";
  return "text-gray-500";
}

function difficultyLabel(d: string) {
  return d?.toUpperCase?.() || "UNKNOWN";
}

export default function PracticeList() {
  const [tests, setTests] = useState<any[]>([]);
  const [menu, setMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);

  // TEMP ROLE
  const role = "admin";

  async function load() {
    const res = await fetch("/api/practice-tests", {
  cache: "no-store",
});
    const data = await res.json();
    setTests(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
  if (!confirm("Delete test?")) return;

  await fetch(`/api/practice-tests/${id}`, {
  method: "DELETE",
});

await load();
}

  async function handleEdit(test: any) {
  const res = await fetch(`/api/practice-tests/${test.id}`, {
  cache: "no-store",
});
  const data = await res.json();

  setEditing(data);
  setMenu(null);
}

useEffect(() => {
  function close() {
    setMenu(null);
  }
  window.addEventListener("click", close);
  return () => window.removeEventListener("click", close);
}, []);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Practice Tests</h1>

        {role === "admin" && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
          >
            Create Test
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 bg-white border rounded-xl p-3 shadow-sm">
        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>All Levels</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>All Parts</option>
          <option>Passage 1</option>
          <option>Passage 2</option>
          <option>Passage 3</option>
          <option>Full Test</option>
        </select>
      </div>

      {/* GROUP */}
      <div className="space-y-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h2 className="text-xl font-semibold">Reading Challenge</h2>
          <p className="text-sm text-gray-500">{tests.length} tests</p>
        </div>

        {/* CARDS */}
        <div className="space-y-4">
          {tests.map((t) => {
            const questionCount =
  (t.sections || []).reduce((acc: number, s: any) => {
    const qs = s?.content?.questions || [];
    return acc + qs.length;
  }, 0);

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border shadow-sm p-6 flex justify-between items-center"
              >
                {/* LEFT */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{t.title}</h3>

                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                      Free
                    </span>
                  </div>

                  <div className="text-sm text-gray-500">
                    {difficultyLabel(t.difficulty)} Level
                  </div>

                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className={difficultyColor(t.difficulty)}>
                      ● {difficultyLabel(t.difficulty)}
                    </span>

                    <span>⏱ {t.duration} minutes</span>

                    <span>✔ {questionCount} questions</span>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col items-end gap-2 relative">
                  <Link
                    href={`/practice/${t.id}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                  >
                    Start Practice
                  </Link>

                  {role === "admin" && (
                    <>
                      <button
  onClick={(e) => {
    e.stopPropagation();
    setMenu(menu === t.id ? null : t.id);
  }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        ⋮
                      </button>

                      {menu === t.id && (
                        <div
  onClick={(e) => e.stopPropagation()}
  className="absolute right-0 top-10 bg-white border rounded-lg shadow-md text-sm"
>
                          <button
                            onClick={() => handleEdit(t)}
                            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(t.id)}
                            className="block px-4 py-2 hover:bg-gray-100 text-red-500 w-full text-left"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <CreatePracticeTestModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      {/* EDIT MODAL */}
      {editing && (
        <CreatePracticeTestModal
          initialData={editing}
          onClose={() => setEditing(null)}
          onCreated={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}