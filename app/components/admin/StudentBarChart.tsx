"use client";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface MonthlyData {
  month: string;
  value: number;
}

interface StudentBarChartProps {
  totalStudents: number;
  monthlyData: MonthlyData[];
  avgStudents: number;
}

export default function StudentBarChart({
  totalStudents,
  monthlyData,
  avgStudents,
}: StudentBarChartProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[420px]">
      <h3 className="text-lg font-semibold mb-4">
        Total Students
      </h3>

      <div className="text-3xl font-bold mb-4">
        {totalStudents}
      </div>

      <ResponsiveContainer width="100%" height="70%">
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <Tooltip />
          <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="text-sm text-gray-500 mt-2">
        Avg: {avgStudents}
      </div>
    </div>
  );
}