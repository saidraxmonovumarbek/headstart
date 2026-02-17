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

const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

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
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
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