import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// GET EVENTS
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  let events;

  if (role === "admin") {
    events = await prisma.event.findMany({
      orderBy: { startTime: "asc" },
      include: { group: true },
    });
  } else {
    events = await prisma.event.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { isGlobal: true },
        ],
      },
      orderBy: { startTime: "asc" },
      include: { group: true },
    });
  }

  return NextResponse.json(events);
}


// CREATE EVENT
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const body = await req.json();
  const { title, description, type, startTime, endTime, groupId } = body;

  if (type === "GLOBAL" && role !== "admin") {
    return NextResponse.json({ error: "Only admin can create global events" }, { status: 403 });
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      type,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isGlobal: type === "GLOBAL",
      creatorId: userId,
      groupId: groupId || null,
    },
  });

  return NextResponse.json(event);
}