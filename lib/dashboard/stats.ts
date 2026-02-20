import prisma from "@/lib/prisma";
import dayjs from "dayjs";

export async function getDashboardStats() {
  const now = dayjs();
  const currentYear = now.year();
  const currentMonth = now.month(); // 0-indexed

  /* ================================
     TOTAL EMPLOYEES (future-proof)
     ================================ */

  const totalEmployees = await prisma.user.count({
    where: {
      role: {
        in: ["teacher", "admin"], // future: add receptionist/support
      },
    },
  });

  const lastMonthEmployees = await prisma.user.count({
    where: {
      role: {
        in: ["teacher", "admin"],
      },
      createdAt: {
        lt: now.startOf("month").toDate(),
      },
    },
  });

  const employeeChange =
    lastMonthEmployees === 0
      ? 0
      : ((totalEmployees - lastMonthEmployees) /
          lastMonthEmployees) *
        100;

  /* ================================
     TEACHER ABSENTEE RATE
     ================================ */

  const totalTeacherAttendance =
    await prisma.teacherAttendance.count();

  const totalTeacherAbsent =
    await prisma.teacherAttendance.count({
      where: { present: false },
    });

  const teacherAbsentRate =
    totalTeacherAttendance === 0
      ? 0
      : (totalTeacherAbsent / totalTeacherAttendance) * 100;

  /* ================================
     STUDENT ABSENTEE RATE
     ================================ */

  const totalStudentAttendance =
    await prisma.studentAttendance.count();

  const totalStudentAbsent =
    await prisma.studentAttendance.count({
      where: { present: false },
    });

  const studentAbsentRate =
    totalStudentAttendance === 0
      ? 0
      : (totalStudentAbsent / totalStudentAttendance) * 100;

  /* ================================
     TOTAL STUDENTS
     ================================ */

  const totalStudents = await prisma.user.count({
  where: {
    role: "student",
    groups: {
      some: {}, // must belong to at least 1 group
    },
  },
});

  /* ================================
     STUDENT MONTHLY SNAPSHOT
     ================================ */

  const monthlyData: { month: string; value: number }[] = [];

  for (let i = 0; i < 12; i++) {
    const endOfMonth = dayjs()
      .year(currentYear)
      .month(i)
      .endOf("month")
      .toDate();

    const count = await prisma.user.count({
      where: {
        role: "student",
        createdAt: {
          lte: endOfMonth,
        },
      },
    });

    monthlyData.push({
      month: dayjs().month(i).format("MMM"),
      value: count,
    });
  }

  const avgStudentsRaw =
  monthlyData.reduce((a, b) => a + b.value, 0) /
  monthlyData.length;

const avgStudents = Math.round(avgStudentsRaw);

  /* ================================
     STUDENT DISTRIBUTION BY LEVEL
     ================================ */

  const groups = await prisma.group.findMany({
  include: {
    students: true,
  },
});

  const levelMap: Record<string, number> = {};

  groups.forEach((group: typeof groups[number]) => {
    const level = group.level || "Unknown";
    const count = group.students.length;

    if (!levelMap[level]) levelMap[level] = 0;
    levelMap[level] += count;
  });

  const levelDistribution = Object.entries(levelMap).map(
    ([level, count]) => ({
      level,
      count,
      percent:
        totalStudents === 0
          ? 0
          : (count / totalStudents) * 100,
    })
  );

  /* ================================
     LIVE CLASSES (current time)
     ================================ */

  const currentTime = now.format("HH:mm");

  const liveGroups = await prisma.group.findMany({
    where: {
      startTime: { lte: currentTime },
      endTime: { gte: currentTime },
    },
    include: {
      teacher1: true,
      teacher2: true,
    },
  });

  /* ================================
     PAYMENT STATUS (structure ready)
     ================================ */

  // Until payment system implemented
  const paymentCompletionRate = 0;

  return {
    totalEmployees,
    employeeChange,

    teacherAbsentRate,
    studentAbsentRate,

    totalStudents,
    monthlyData,
    avgStudents,

    levelDistribution,

    liveGroups,

    paymentCompletionRate,
  };
}