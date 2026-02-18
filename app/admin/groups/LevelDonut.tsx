"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: {
    level: string;
    count: number;
    color: string;
  }[];
  total: number;
}

export default function LevelDonut({ data, total }: Props) {
  return (
    <div className="relative w-full h-[320px] flex items-center justify-center">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="level"
            innerRadius={90}
            outerRadius={120}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* CENTER CONTENT */}
      <div className="absolute flex flex-col items-center">
        <div className="text-gray-500 text-sm">
          Total Groups
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {total}
        </div>
      </div>
    </div>
  );
}