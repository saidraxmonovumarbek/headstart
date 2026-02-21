import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any).isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, amount } = await req.json();

  if (!title || !amount) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const month = dayjs().format("YYYY-MM");

  await prisma.expense.create({
    data: { title, amount: Number(amount), month },
  });

  return NextResponse.json({ success: true });
}