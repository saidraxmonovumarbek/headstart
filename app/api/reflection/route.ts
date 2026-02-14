import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// GET reflection by date
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Missing date" }, { status: 400 });
  }

  const reflection = await prisma.dailyReflection.findUnique({
    where: {
      userId_date: {
        userId: (session.user as any).id,
        date,
      },
    },
  });

  return NextResponse.json(reflection || null);
}

// CREATE / UPDATE reflection
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, content } = await req.json();

  const userId = (session.user as any).id;

  const reflection = await prisma.dailyReflection.upsert({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
    update: {
      content,
    },
    create: {
      userId,
      date,
      content,
    },
  });

  return NextResponse.json(reflection);
}