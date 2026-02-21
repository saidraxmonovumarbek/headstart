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
  });
}