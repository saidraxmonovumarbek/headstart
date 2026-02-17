import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !["admin", "teacher"].includes((session.user as any).role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { studentId, groupId, paid } = body;

  if (!studentId || !groupId) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group || !group.monthlyPrice) {
    return NextResponse.json({ error: "Invalid group" }, { status: 400 });
  }

  const currentMonth = dayjs().format("YYYY-MM");

  const existing = await prisma.payment.findUnique({
    where: {
      studentId_groupId_month: {
        studentId,
        groupId,
        month: currentMonth,
      },
    },
  });

  let teacherRevenue = 0;
  let headstartRevenue = 0;

  if (paid) {
    const teacherPercent = group.teacherPercent ?? 0;
    const headstartPercent = group.headstartPercent ?? 0;

    teacherRevenue = Math.floor(
      (group.monthlyPrice * teacherPercent) / 100
    );

    headstartRevenue = Math.floor(
      (group.monthlyPrice * headstartPercent) / 100
    );
  }

  if (existing) {
    await prisma.payment.update({
      where: { id: existing.id },
      data: {
        paid,
        amountPaid: paid ? group.monthlyPrice : 0,
        teacherRevenue,
        headstartRevenue,
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        studentId,
        groupId,
        month: currentMonth,
        paid,
        amountPaid: paid ? group.monthlyPrice : 0,
        teacherRevenue,
        headstartRevenue,
      },
    });
  }

  return NextResponse.json({ success: true });
}