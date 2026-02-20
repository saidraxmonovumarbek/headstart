import prisma from "@/lib/prisma";
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
    // Admin sees:
    // 1) Global events
    // 2) Events they personally created
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

  else if (role === "teacher") {
    // Teacher sees:
    // 1) Their own created events
    // 2) Global events
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

  else {
  // Student sees:
  // 1) Global events
  // 2) Their own created events
  // 3) Class events where they belong
  events = await prisma.event.findMany({
    where: {
      OR: [
        { isGlobal: true },
        { creatorId: userId },
        {
          group: {
            students: {
              some: { id: userId },
            },
          },
        },
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

  const body = await req.json();
  const { title, type, startTime, endTime } = body;

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const isGlobal = type === "GLOBAL";

  // Only admin can create global events
  if (type === "GLOBAL" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const event = await prisma.event.create({
    data: {
      title,
      type,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      creatorId: userId,
      isGlobal,
    },
  });

  return NextResponse.json(event);
}