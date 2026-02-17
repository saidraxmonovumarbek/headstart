"use client";

import { Users, Percent, GraduationCap } from "lucide-react";
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
    <div className="grid grid-cols-3 divide-x divide-gray-200 bg-transparent">
      
      {/* TOTAL EMPLOYEES */}
      <StatItem
        icon={<Users size={18} className="text-gray-400" />}
        title="Total Employees"
        value={totalEmployees}
        change={employeeChange}
      />

      {/* TEACHER ABSENT RATE */}
      <StatItem
        icon={<Percent size={18} className="text-gray-400" />}
        title="Teacher Absentee Rate"
        value={teacherAbsentRate}
        isPercent
      />

      {/* STUDENT ABSENT RATE */}
      <StatItem
        icon={<GraduationCap size={18} className="text-gray-400" />}
        title="Student Absentee Rate"
        value={studentAbsentRate}
        isPercent
      />

    </div>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  change?: number;
  isPercent?: boolean;
}

function StatItem({
  icon,
  title,
  value,
  change,
  isPercent,
}: StatItemProps) {
  return (
    <div className="px-6">

      {/* Title Row */}
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-sm text-gray-500 font-medium">
          {title}
        </span>
      </div>

      {/* Main Value */}
      <div className="text-4xl font-bold text-gray-900 leading-none">
        <AnimatedCounter value={value} />
        {isPercent && "%"}
      </div>

      {/* Change */}
      {typeof change === "number" && (
        <div
          className={`mt-2 text-sm font-medium ${
            change >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)}% from last month
        </div>
      )}
    </div>
  );
}