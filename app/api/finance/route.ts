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

  const payments = await prisma.payment.findMany({
    where: {
      month: currentMonth,
      paid: true,
    },
  });

  let totalCollected = 0;
  let totalHeadstart = 0;
  let totalTeacher = 0;

  payments.forEach((p) => {
    totalCollected += p.amountPaid ?? 0;
    totalHeadstart += p.headstartRevenue ?? 0;
    totalTeacher += p.teacherRevenue ?? 0;
  });

  return NextResponse.json({
    totalCollected,
    totalHeadstart,
    totalTeacher,
  });
}