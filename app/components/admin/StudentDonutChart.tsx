"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface LevelData {
  level: string;
  count: number;
  percent: number;
}

interface Props {
  data: LevelData[];
  totalStudents: number;
}

const COLORS = {
  Beginner: "#10b981",
  Elementary: "#34d399",
  "Pre-Intermediate": "#6ee7b7",
  Intermediate: "#a7f3d0",
  "Upper-Intermediate": "#3b82f6",
  Advanced: "#6366f1",
  IELTS: "#8b5cf6",
  Kids: "#f59e0b",
  CEFR: "#ef4444",
};

export default function StudentDonutChart({
  data,
  totalStudents,
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[420px]">
      <h3 className="text-lg font-semibold mb-4">
        Student Distribution
      </h3>

      <ResponsiveContainer width="100%" height="70%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="level"
            innerRadius={80}
            outerRadius={120}
          >
            {data.map((entry) => (
  <Cell
    key={entry.level}
    fill={COLORS[entry.level as keyof typeof COLORS] || "#9ca3af"}
  />
))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <div className="text-center text-sm text-gray-500 mt-2">
        Total: {totalStudents}
      </div>
    </div>
  );
}