import prisma from "@/lib/prisma";
import dayjs from "dayjs";

const LEVEL_COLORS: Record<string, string> = {
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

export async function getGroupsStats() {
  const currentMonth = dayjs().format("YYYY-MM");

  /* ================================
     TOTAL GROUPS
  ================================= */

  const totalGroups = await prisma.group.count();

  /* ================================
     GROUP DISTRIBUTION BY LEVEL
  ================================= */

  const groups = await prisma.group.findMany({
    select: {
      level: true,
    },
  });

  const levelMap: Record<string, number> = {};

  groups.forEach((g) => {
    const level = g.level || "Unknown";
    if (!levelMap[level]) levelMap[level] = 0;
    levelMap[level] += 1;
  });

  const levelDistribution = Object.entries(levelMap)
  .map(([level, count]) => ({
    level,
    count,
    color: LEVEL_COLORS[level] || "#9CA3AF",
  }))
  .sort((a, b) => b.count - a.count); // highest first

  /* ================================
     WORST PAYMENT GROUPS (TOP 3)
     Current month only
  ================================= */

  const groupsWithStudents = await prisma.group.findMany({
    include: {
      teacher1: true,
      students: {
        include: {
          payments: {
            where: {
              month: currentMonth,
            },
          },
        },
      },
    },
  });

  const paymentStats = groupsWithStudents.map((group) => {
    const totalStudents = group.students.length;

    const paidCount = group.students.filter(
      (s) => s.payments[0]?.paid
    ).length;

    const completionRate =
      totalStudents === 0
        ? 0
        : Math.round((paidCount / totalStudents) * 100);

    return {
      id: group.id,
      name: group.name,
      teacherName: group.teacher1?.name || "No Teacher",
      startTime: group.startTime,
      endTime: group.endTime,
      completionRate,
    };
  });

  const worstPaymentGroups = paymentStats
    .sort((a, b) => a.completionRate - b.completionRate)
    .slice(0, 3);

  return {
    totalGroups,
    levelDistribution,
    worstPaymentGroups,
  };
}