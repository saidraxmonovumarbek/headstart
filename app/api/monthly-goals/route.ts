import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// GET goals by month
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  if (!month) {
    return NextResponse.json({ error: "Missing month" }, { status: 400 });
  }

  const goals = await prisma.monthlyGoal.findUnique({
    where: {
      userId_month: {
        userId: (session.user as any).id,
        month,
      },
    },
  });

  return NextResponse.json(goals || null);
}

// CREATE / UPDATE goals
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { month, goals } = await req.json();

  const userId = (session.user as any).id;

  const result = await prisma.monthlyGoal.upsert({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
    update: {
      goals,
    },
    create: {
      userId,
      month,
      goals,
    },
  });

  return NextResponse.json(result);
}