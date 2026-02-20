"use client";

import MCQ from "./questions/MCQ";
import TFNG from "./questions/TFNG";
import Fill from "./questions/Fill";

export default function QuestionEngine({
  question,
  answer,
  setAnswer,
}: any) {
  switch (question.type) {
    case "MCQ":
      return <MCQ question={question} answer={answer} setAnswer={setAnswer} />;

    case "TRUE_FALSE_NG":
      return <TFNG question={question} answer={answer} setAnswer={setAnswer} />;

    case "FILL":
      return <Fill question={question} answer={answer} setAnswer={setAnswer} />;

    default:
      return <div>Unsupported question type</div>;
  }
}