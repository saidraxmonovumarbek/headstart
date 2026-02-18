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
  const currentMonth = dayjs().format("YYYY-MM");

  const groups = await prisma.group.findMany({
    include: {
      teacher1: true,
      teacher2: true,
      students: {
        include: {
          payments: {
            where: {
              month: currentMonth,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(groups);
}

  if (role === "teacher") {
  const currentMonth = dayjs().format("YYYY-MM");

  const groups = await prisma.group.findMany({
    where: {
  OR: [
    { teacher1Id: userId },
    { teacher2Id: userId },
    { teacher3Id: userId },
  ],
},
    include: {
      teacher1: true,
      teacher2: true,
      students: {
        include: {
          payments: {
            where: {
              month: currentMonth,
            },
          },
        },
      },
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
    level,
    monthlyPrice,
    dayType,
    customDays,
    startTime,
    endTime,
    teacher1Id,
    teacher2Id,
    teacher3Id,
    revenueSplits,
  } = body;

  if (!level) {
    return NextResponse.json({ error: "Level is required" }, { status: 400 });
  }

  if (!teacher1Id) {
    return NextResponse.json({ error: "Teacher 1 is required" }, { status: 400 });
  }

  const totalPercent = revenueSplits.reduce(
  (sum: number, r: any) => sum + Number(r.percentage),
  0
);

if (totalPercent !== 100) {
  return NextResponse.json(
    { error: "Revenue split must equal 100%" },
    { status: 400 }
  );
}

  const group = await prisma.group.create({
  data: {
    name,
    level,
    monthlyPrice: Number(monthlyPrice),
    dayType,
    customDays:
      dayType === "CUSTOM"
        ? JSON.stringify(customDays)
        : null,
    startTime,
    endTime,
    teacher1Id,
    teacher2Id: teacher2Id || null,
    teacher3Id: teacher3Id || null,
  },
});

  await prisma.groupRevenueSplit.createMany({
  data: revenueSplits.map((r: any) => ({
    groupId: group.id,
    userId: r.userId || null,
    percentage: Number(r.percentage),
  })),
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