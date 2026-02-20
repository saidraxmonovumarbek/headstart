export function validateAnswer(user: string, correct: string) {
  const clean = (v: string) =>
    v
      .toLowerCase()
      .trim()
      .replace(/[-]/g, " ")
      .replace(/[.,]/g, "")
      .replace(/\b(a|an|the)\b/g, "")
      .trim();

  return clean(user) === clean(correct);
}