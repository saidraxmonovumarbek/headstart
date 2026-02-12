import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  if (role === "admin") {
    const groups = await prisma.group.findMany({
      include: {
        teacher1: true,
        teacher2: true,
        students: true,
      },
    });
    return NextResponse.json(groups);
  }

  if (role === "teacher") {
  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { teacher1Id: userId },
        { teacher2Id: userId },
      ],
    },
    include: {
      teacher1: true,
      teacher2: true,
    },
  });
  return NextResponse.json(groups);
}

if (role === "student") {
  const groups = await prisma.group.findMany({
    where: {
      students: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      teacher1: true,
      teacher2: true,
    },
  });

  return NextResponse.json(groups);
}

return NextResponse.json([]);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const {
  name,
  monthlyPrice,
  dayType,
  customDays,
  startTime,
  endTime,
  teacher1Id,
  teacher2Id,
} = body;

  const group = await prisma.group.create({
  data: {
    name,
    monthlyPrice: Number(monthlyPrice),
    dayType,
    customDays:
      dayType === "CUSTOM"
        ? JSON.stringify(customDays)
        : null,
    startTime,
    endTime,
    teacher1Id: teacher1Id || null,
    teacher2Id: teacher2Id || null,
  },
});

  await generateRecurringEvents(group.id);

  return NextResponse.json(group);
}

/* ===========================
   CLEAN RECURRING GENERATOR
=========================== */

async function generateRecurringEvents(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group || !group.dayType || !group.startTime || !group.endTime) return;

  const today = dayjs();
  const eventsToCreate: any[] = [];

  for (let i = 0; i < 365; i++) {
    const date = today.add(i, "day");
    const dayOfWeek = date.day(); // 0=Sun

    let shouldCreate = false;

    // ODD → Mon/Wed/Fri
    if (group.dayType === "ODD") {
      shouldCreate =
        dayOfWeek === 1 ||
        dayOfWeek === 3 ||
        dayOfWeek === 5;
    }

    // EVEN → Tue/Thu/Sat
    if (group.dayType === "EVEN") {
      shouldCreate =
        dayOfWeek === 2 ||
        dayOfWeek === 4 ||
        dayOfWeek === 6;
    }

    // INTENSIVE → Mon-Sat
    if (group.dayType === "INTENSIVE") {
      shouldCreate = dayOfWeek >= 1 && dayOfWeek <= 6;
    }

    // CUSTOM
    if (group.dayType === "CUSTOM" && group.customDays) {
      const custom = JSON.parse(group.customDays);
      const map = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
      const todayName = map[dayOfWeek];
      shouldCreate = custom.includes(todayName);
    }

    if (!shouldCreate) continue;

    const [startH, startM] = group.startTime.split(":");
    const [endH, endM] = group.endTime.split(":");

    const start = date
      .hour(Number(startH))
      .minute(Number(startM))
      .second(0)
      .toDate();

    const end = date
      .hour(Number(endH))
      .minute(Number(endM))
      .second(0)
      .toDate();

    eventsToCreate.push({
      title: group.name,
      type: "CLASS",
      startTime: start,
      endTime: end,
      creatorId: group.teacher1Id!,
      groupId: group.id,
    });
  }

  if (eventsToCreate.length > 0) {
    await prisma.event.createMany({
      data: eventsToCreate,
    });
  }
}