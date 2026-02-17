"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  month: string;
  value: number;
}

interface StudentBarChartProps {
  totalStudents: number;
  monthlyData: MonthlyData[];
}

export default function StudentBarChart({
  totalStudents,
  monthlyData,
}: StudentBarChartProps) {
  const [view, setView] = useState<"yearly" | "monthly">("yearly");

  const fullMonthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const currentMonth = new Date().getMonth();
  const daysInMonth = new Date(
    new Date().getFullYear(),
    currentMonth + 1,
    0
  ).getDate();

  const monthlyViewData = Array.from({ length: daysInMonth }, (_, i) => ({
    month: `${i + 1}`,
    value: 0,
  }));

  const chartData =
    view === "yearly" ? monthlyData : monthlyViewData;

  return (
    <div className="h-[420px] flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Total Students
          </h3>
          <div className="text-4xl font-bold mt-2">
            {totalStudents}
          </div>
        </div>

        <select
          value={view}
          onChange={(e) =>
            setView(e.target.value as "yearly" | "monthly")
          }
          className="text-sm border border-gray-200 rounded-lg px-3 py-1 text-gray-600 focus:outline-none"
        >
          <option value="yearly">This year</option>
          <option value="monthly">This month</option>
        </select>
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const label =
                  view === "yearly"
                    ? fullMonthNames[
                        monthlyData.findIndex(
                          (m) => m.month === payload[0].payload.month
                        )
                      ]
                    : `Day ${payload[0].payload.month}`;

                return (
                  <div className="bg-white rounded-xl shadow-md px-4 py-3 border border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {label}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {payload[0].value} students
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          <Bar
            dataKey="value"
            fill="#10b981"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}