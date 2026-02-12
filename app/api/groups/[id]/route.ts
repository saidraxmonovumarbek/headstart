import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await prisma.group.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !["admin", "teacher"].includes((session.user as any).role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();
  const { studentId } = body;

  if (!studentId) {
    return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "Invalid student" }, { status: 400 });
  }

  await prisma.group.update({
    where: { id },
    data: {
      students: {
        connect: { id: studentId },
      },
    },
  });

  return NextResponse.json({ success: true });
}