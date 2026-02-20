"use client";

import { useEffect, useState } from "react";
import CreatePracticeTestModal from "./components/CreatePracticeTestModal";
import { useRouter } from "next/navigation";

export default function AdminPracticePage() {
  const [tests, setTests] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const router = useRouter();

  async function load() {
    const res = await fetch("/api/practice-tests");
    const data = await res.json();
    setTests(data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Practice Tests</h1>

        <button
          onClick={() => setShow(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Create Test
        </button>
      </div>

      <div className="space-y-3">
        {tests.map((t) => (
          <div
            key={t.id}
            className="border p-4 rounded-xl cursor-pointer"
            onClick={() => router.push(`/admin/practice/${t.id}/editor`)}
          >
            {t.title}
          </div>
        ))}
      </div>

      {show && (
        <CreatePracticeTestModal
          onClose={() => setShow(false)}
          onCreated={(id) => router.push(`/admin/practice/${id}/editor`)}
        />
      )}
    </div>
  );
}