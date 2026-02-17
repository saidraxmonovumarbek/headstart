"use client";

import AnimatedCounter from "@/app/components/AnimatedCounter";

interface TopStatsProps {
  totalEmployees: number;
  employeeChange: number;
  teacherAbsentRate: number;
  studentAbsentRate: number;
}

export default function TopStats({
  totalEmployees,
  employeeChange,
  teacherAbsentRate,
  studentAbsentRate,
}: TopStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <StatCard
        title="Total Employees"
        value={totalEmployees}
        change={employeeChange}
      />
      <StatCard
        title="Teacher Absentee Rate"
        value={teacherAbsentRate}
        isPercent
      />
      <StatCard
        title="Student Absentee Rate"
        value={studentAbsentRate}
        isPercent
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  isPercent?: boolean;
}

function StatCard({ title, value, change, isPercent }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <p className="text-gray-500 text-sm mb-2">{title}</p>

      <div className="text-3xl font-bold text-gray-900">
        <AnimatedCounter value={value} />
        {isPercent && "%"}
      </div>

      {typeof change === "number" && (
        <p className="text-green-500 text-sm mt-1">
          +{change}% from last month
        </p>
      )}
    </div>
  );
}