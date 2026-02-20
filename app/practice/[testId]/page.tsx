"use client";

import { useEffect, useState } from "react";

import ExamShell from "@/app/components/practice/layout/ExamShell";
import ReadingSplit from "@/app/components/practice/layout/ReadingSplit";

import HighlightLayer from "@/app/components/practice/highlight/HighlightLayer";

import QuestionEngine from "@/app/components/practice/QuestionEngine";
import QuestionPalette from "@/app/components/practice/QuestionPalette";

import { useExamTimer } from "@/app/components/practice/hooks/useExamTimer";

export default function PracticeTest({
  params,
}: {
  params: { testId: string };
}) {
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [active, setActive] = useState<string | null>(null);

  const timer = useExamTimer(60 * 60);

  // AUTO SAVE
useEffect(() => {
  localStorage.setItem(
    `practice_${params.testId}_answers`,
    JSON.stringify(answers)
  );
}, [answers]);

// LOAD ON START
useEffect(() => {
  const saved = localStorage.getItem(`practice_${params.testId}_answers`);
  if (saved) setAnswers(JSON.parse(saved));
}, []);

  // fetch test
  useEffect(() => {
    fetch(`/api/practice-tests/${params.testId}`)
      .then((r) => r.json())
      .then((data) => {
        setTest(data);

        // init answers
        const map: any = {};
        data.sections?.forEach((s: any) => {
          s.content?.questions?.forEach((q: any) => {
            map[q.id] = "";
          });
        });
        setAnswers(map);
      });
  }, [params.testId]);

  function setAnswer(id: string, value: any) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function submit() {
    console.log("SUBMIT", answers);
  }

  if (!test) return <div className="p-10">Loading...</div>;

  const passageSections =
    test.sections?.filter((s: any) => s.content?.passage) || [];

  const questionSections =
    test.sections?.filter((s: any) => s.content?.questions) || [];

  const questions = questionSections.flatMap(
    (s: any) => s.content.questions
  );

  return (
    <ExamShell timer={timer.formatted} onSubmit={submit}>
      <ReadingSplit
        passage={
          <HighlightLayer testId={params.testId}>
            <div>
              {passageSections.map((s: any) => (
                <div key={s.id} className="mb-10">
                  <h2 className="font-bold mb-3">{s.title}</h2>

                  {s.content.passage?.map((p: any) => (
                    <p
                      key={p.id}
                      id={p.id}
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