import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  if (role !== "admin" && role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { groupId, studentId } = await req.json();

  // Validate student
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
  }

  // If teacher → ensure teacher owns this group
  if (role === "teacher") {
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { teacher1Id: userId },
          { teacher2Id: userId },
        ],
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Connect student to group
  await prisma.group.update({
    where: { id: groupId },
    data: {
      students: {
        connect: { id: studentId },
      },
    },
  });

  return NextResponse.json({ success: true });
}