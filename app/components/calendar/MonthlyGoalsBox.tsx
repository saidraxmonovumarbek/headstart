"use client";

import { useEffect, useState } from "react";

interface Props {
  currentMonth: any;
}

export default function MonthlyGoalsBox({ currentMonth }: Props) {
  const [goals, setGoals] = useState<string[]>(["", "", ""]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadGoals() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/monthly-goals?month=${currentMonth.format("YYYY-MM")}`
        );

        if (!res.ok) {
          setGoals(["", "", ""]);
          return;
        }

        const text = await res.text();

        if (!text) {
          setGoals(["", "", ""]);
          return;
        }

        const data = JSON.parse(text);

        if (data?.goals?.length) {
          setGoals(data.goals);
        } else {
          setGoals(["", "", ""]);
        }
      } catch {
        setGoals(["", "", ""]);
      } finally {
        setLoading(false);
      }
    }

    loadGoals();
  }, [currentMonth]);

  useEffect(() => {
    if (loading) return;

    const timeout = setTimeout(async () => {
      const cleanedGoals = goals
        .map((g) => g.trim())
        .filter((g) => g.length > 0);

      await fetch("/api/monthly-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: currentMonth.format("YYYY-MM"),
          goals: cleanedGoals,
        }),
      });
    }, 800);

    return () => clearTimeout(timeout);
  }, [goals, currentMonth, loading]);

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">
        What are your goals for {currentMonth.format("MMMM")}?
      </h3>

      <div className="space-y-2">
        {goals.map((goal, index) => (
          <div key={index} className="relative group">
            <input
              value={goal}
              onChange={(e) => {
                const updated = [...goals];
                updated[index] = e.target.value;
                setGoals(updated);
              }}
              className="w-full rounded-lg p-2 pr-8 text-sm text-black outline-none"
              placeholder={`Goal ${index + 1}`}
            />

            {goals.length > 1 && (
              <button
                onClick={() => {
                  const updated = goals.filter((_, i) => i !== index);
                  setGoals(updated);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 transition text-xs"
              >
                −
              </button>
            )}
          </div>
        ))}
      </div>

      {goals.length < 7 && (
        <button
          onClick={() => setGoals([...goals, ""])}
          className="mt-2 text-xs opacity-80 hover:opacity-100 transition"
        >
          + Add goal
        </button>
      )}

      <div className="text-xs mt-2 opacity-60 text-right">
        {goals.length} / 7 goals
      </div>
    </div>
  );
}