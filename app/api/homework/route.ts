import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json({ error: "Missing groupId" }, { status: 400 });
  }

  const homeworks = await prisma.homework.findMany({
    where: { groupId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(homeworks);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { content, date, groupId } = body;

  const homework = await prisma.homework.create({
    data: {
      content,
      date: new Date(date),
      groupId,
      teacherId: (session.user as any).id,
    },
  });

  return NextResponse.json(homework);
}