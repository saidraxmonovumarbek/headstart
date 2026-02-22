import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any).isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentMonth = dayjs().format("YYYY-MM");

  // =========================
  // PAYMENTS
  // =========================
  const payments = await prisma.payment.findMany({
    where: {
      month: currentMonth,
      paid: true,
    },
    orderBy: { createdAt: "desc" },
    include: {
      student: true,
      group: {
        include: {
          revenueSplits: {
            include: { user: true },
          },
        },
      },
    },
    take: 20,
  });

  // =========================
  // EXPENSES
  // =========================
  const expenses = await prisma.expense.findMany({
    where: { month: currentMonth },
    orderBy: { createdAt: "desc" },
  });

  // =========================
// EMPLOYEE PAYROLL
// =========================
const employeePayroll = await prisma.employeePayroll.findMany({
  where: { month: currentMonth },
  orderBy: { createdAt: "desc" },
});

// =========================
// TEACHER PAYROLL (AGGREGATE FROM PAYMENTS)
// =========================
const teacherPayrollMap: Record<string, any> = {};

payments.forEach((p) => {
  p.group.revenueSplits
    .filter((s) => s.user)
    .forEach((s) => {
      const teacherId = s.userId!;
      const teacherName = s.user?.name || "Teacher";

      if (!teacherPayrollMap[teacherId]) {
        teacherPayrollMap[teacherId] = {
          id: teacherId,
          name: teacherName,
          position: "Teacher",
          salary: 0,
          type: null,
          status: "pending",
          paidAt: null,
        };
      }

      teacherPayrollMap[teacherId].salary += Math.floor(
  (p.group.monthlyPrice! * s.percentage) / 100
);
    });
});

const teacherPayroll = Object.values(teacherPayrollMap);

// =========================
// ENSURE TEACHER PAYROLL PERSISTENCE
// =========================
for (const t of teacherPayroll) {
  const existing = await prisma.employeePayroll.findFirst({
    where: {
      month: currentMonth,
      name: t.name,
      position: "Teacher",
    },
  });

  if (!existing) {
    await prisma.employeePayroll.create({
      data: {
        name: t.name,
        position: "Teacher",
        salary: t.salary,
        status: "pending",
        type: null,
        month: currentMonth,
      },
    });
  } else {
    // update salary realtime
    await prisma.employeePayroll.update({
      where: { id: existing.id },
      data: { salary: t.salary },
    });
  }
}

const payroll = await prisma.employeePayroll.findMany({
  where: { month: currentMonth },
  orderBy: { createdAt: "desc" },
});

  // =========================
  // TOTALS
  // =========================
  let totalCollected = 0;
  let totalHeadstart = 0;
  let totalTeacher = 0;
  let totalExpenses = 0;

  payments.forEach((p) => {
    totalCollected += p.amountPaid ?? 0;
    totalHeadstart += p.headstartRevenue ?? 0;
    totalTeacher += p.teacherRevenue ?? 0;
  });

  expenses.forEach((e: any) => {
  totalExpenses += e.amount;
});

payroll.forEach((p) => {
  if (p.status === "paid") {
    totalExpenses += p.salary;
  }
});

  const netProfit = totalHeadstart - totalExpenses;

  // =========================
  // TRANSACTIONS LIST
  // =========================
  const transactions = payments.map((p) => {
    const teachers =
      p.group.revenueSplits
        .filter((s) => s.user)
        .map((s) => s.user?.name)
        .join(", ") || "Headstart";

    return {
      id: p.id,
      studentName: p.student.name,
      groupName: p.group.name,
      teacherName: teachers,
      amountPaid: p.amountPaid,
      headstartRevenue: p.headstartRevenue,
      teacherRevenue: p.teacherRevenue,
      createdAt: p.createdAt,
    };
  });

  // =========================
// DAILY ANALYTICS DATASET
// =========================
const daysInMonth = dayjs().daysInMonth();

const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
  day: i + 1,
  collected: 0,
  teacher: 0,
  expenses: 0,
  net: 0,
}));

payments.forEach((p) => {
  const day = dayjs(p.createdAt).date() - 1;
  dailyData[day].collected += p.headstartRevenue ?? 0;
  dailyData[day].teacher += p.teacherRevenue ?? 0;
});

expenses.forEach((e) => {
  const day = dayjs(e.createdAt).date() - 1;
  dailyData[day].expenses += e.amount;
});

payroll.forEach((e) => {
  if (e.status === "paid" && e.paidAt) {
    const day = dayjs(e.paidAt).date() - 1;
    dailyData[day].expenses += e.salary;
  }
});

dailyData.forEach((d) => {
  d.net = d.collected - d.expenses;
});

  // =========================
  // RESPONSE
  // =========================
  return NextResponse.json({
    totalCollected,
    totalHeadstart,
    totalTeacher,
    totalExpenses,
    netProfit,
    transactions,
    expenses,
    dailyData,
    payroll,
  });
}