import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export const runtime = "nodejs";

/* ================= GET ================= */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || dayjs().format("YYYY-MM");

  const employees = await prisma.employeePayroll.findMany({
    where: { month },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(employees);
}

/* ================= POST ================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const month = dayjs().format("YYYY-MM");

    if (!body.name || !body.position || !body.salary) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // prevent duplicates same month
    const existing = await prisma.employeePayroll.findFirst({
      where: {
        name: body.name,
        position: body.position,
        month,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Employee already exists this month" },
        { status: 400 }
      );
    }

    const created = await prisma.employeePayroll.create({
      data: {
        name: body.name,
        position: body.position,
        salary: Number(body.salary),
        status: "pending",
        type: null,
        paidAt: null,
        month,
      },
    });

    return NextResponse.json(created);
  } catch (err) {
    console.error("PAYROLL POST ERROR:", err);
    return NextResponse.json(
      { error: "Creation failed" },
      { status: 500 }
    );
  }
}