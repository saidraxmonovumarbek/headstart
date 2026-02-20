"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ExamShell from "@/app/components/practice/layout/ExamShell";
import ReadingSplit from "@/app/components/practice/layout/ReadingSplit";
import HighlightLayer from "@/app/components/practice/highlight/HighlightLayer";
import QuestionEngine from "@/app/components/practice/QuestionEngine";
import QuestionPalette from "@/app/components/practice/QuestionPalette";
import { useExamTimer } from "@/app/components/practice/hooks/useExamTimer";

export default function PracticeTest() {
  const { testId } = useParams() as { testId: string };
  const router = useRouter();

  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [active, setActive] = useState<string | null>(null);

  // AUTO SAVE
  useEffect(() => {
    if (!testId) return;

    localStorage.setItem(
      `practice_${testId}_answers`,
      JSON.stringify(answers)
    );
  }, [answers, testId]);

  // LOAD ON START
  useEffect(() => {
    if (!testId) return;

    const saved = localStorage.getItem(`practice_${testId}_answers`);
    if (saved) setAnswers(JSON.parse(saved));
  }, [testId]);

  // FETCH TEST
  useEffect(() => {
    if (!testId) return;

    fetch(`/api/practice-tests/${testId}`)
      .then((r) => r.json())
      .then((data) => {
        setTest(data);

        const map: any = {};
        data?.sections?.forEach((s: any) => {
          s.content?.questions?.forEach((q: any) => {
            map[q.id] = "";
          });
        });

        setAnswers((prev) => ({ ...map, ...prev }));
      });
  }, [testId]);

  async function deleteTest() {
    if (!confirm("Delete test?")) return;

    await fetch(`/api/practice-tests/${testId}`, {
      method: "DELETE",
    });

    router.push("/practice");
  }

  function editTest() {
    router.push(`/admin/practice/${testId}/editor`);
  }

  function setAnswer(id: string, value: any) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function submit() {
    console.log("SUBMIT", answers);
  }

  const timer = useExamTimer(test?.duration ?? 0);

if (!test) return <div className="p-10">Loading...</div>;

  const passageSections =
    test?.sections?.filter((s: any) => s.content?.passage) || [];

  const questionSections =
    test?.sections?.filter((s: any) => s.content?.questions) || [];

  const questions = questionSections.flatMap(
    (s: any) => s.content.questions || []
  );

  return (
    <ExamShell timer={timer.formatted} onSubmit={submit}>
      {/* ADMIN ACTIONS */}
      <div className="absolute top-6 right-6 z-50">
        <div className="flex gap-2">
          <button
            onClick={editTest}
            className="px-3 py-1 text-sm border rounded-lg"
          >
            Edit
          </button>

          <button
            onClick={deleteTest}
            className="px-3 py-1 text-sm border rounded-lg text-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      <ReadingSplit
        passage={
          <HighlightLayer testId={testId}>
            <div>
              {passageSections.map((s: any) => (
                <div key={s.id} className="mb-10">
                  <h2 className="font-bold mb-3">{s.title}</h2>

                  {s.content?.passage?.map((p: any, i: number) => (
                    <p
                      key={p.id || i}
                      id={p.id || `p_${i}`}
                      className="mb-4 leading-relaxed"
                    >
                      {p.text}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </HighlightLayer>
        }
      >
        {questions.map((q: any) => (
          <QuestionEngine
            key={q.id}
            question={q}
            answer={answers[q.id]}
            setAnswer={setAnswer}
          />
        ))}
      </ReadingSplit>

      <QuestionPalette
        questions={questions}
        answers={answers}
        active={active}
        onSelect={setActive}
      />
    </ExamShell>
  );
}