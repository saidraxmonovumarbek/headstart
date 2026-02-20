import prisma from "@/lib/prisma";
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
    const splits = await prisma.groupRevenueSplit.findMany({
      where: { groupId },
    });

    if (splits.length === 0) {
      return NextResponse.json(
        { error: "Revenue splits not configured for this group." },
        { status: 400 }
      );
    }

    for (const split of splits) {
      const revenue = Math.floor(
        (group.monthlyPrice * split.percentage) / 100
      );

      if (split.userId === null) {
        // Headstart
        headstartRevenue += revenue;
      } else {
        // Teacher (or any assigned user)
        teacherRevenue += revenue;
      }
    }
  }

  const paymentData = {
    paid,
    amountPaid: paid ? group.monthlyPrice : 0,
    teacherRevenue: paid ? teacherRevenue : 0,
    headstartRevenue: paid ? headstartRevenue : 0,
  };

  if (existing) {
    await prisma.payment.update({
      where: { id: existing.id },
      data: paymentData,
    });
  } else {
    await prisma.payment.create({
      data: {
        studentId,
        groupId,
        month: currentMonth,
        ...paymentData,
      },
    });
  }

  return NextResponse.json({ success: true });
}