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

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
){
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
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
    revenueSplits
  } = body;

  /* =========================
     VALIDATIONS
  ========================= */

  if (!teacher1Id) {
    return NextResponse.json(
      { error: "Teacher 1 required" },
      { status: 400 }
    );
  }

  const totalPercent = revenueSplits.reduce(
    (sum:number, r:any)=> sum + Number(r.percentage || 0),
    0
  );

  if (totalPercent !== 100) {
    return NextResponse.json(
      { error: "Revenue split must equal 100%" },
      { status: 400 }
    );
  }

  /* =========================
     NORMALIZE customDays
  ========================= */

  let normalizedCustomDays = null;

  if (dayType === "CUSTOM") {
    if (Array.isArray(customDays)) {
      normalizedCustomDays = JSON.stringify(customDays);
    } else if (typeof customDays === "string") {
      normalizedCustomDays = customDays;
    }
  }

  /* =========================
     TRANSACTION SAFE UPDATE
  ========================= */

  const result = await prisma.$transaction(async (tx)=>{

    const group = await tx.group.update({
      where:{ id },
      data:{
        name,
        level,
        monthlyPrice:Number(monthlyPrice),
        dayType,
        customDays: normalizedCustomDays,
        startTime,
        endTime,
        teacher1Id,
        teacher2Id: teacher2Id || null,
        teacher3Id: teacher3Id || null,
      }
    });

    await tx.groupRevenueSplit.deleteMany({
      where:{ groupId: id }
    });

    await tx.groupRevenueSplit.createMany({
      data: revenueSplits.map((r:any)=>({
        groupId: id,
        userId: r.userId || null,
        percentage: Number(r.percentage),
      }))
    });

    return group;
  });

  return NextResponse.json(result);
}