import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const existing = await prisma.employeePayroll.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Payroll not found" },
        { status: 404 }
      );
    }

    const data: any = {};

    if (body.type !== undefined) {
      data.type = body.type;
    }

    if (body.status !== undefined) {
      data.status = body.status;

      // ⭐ lock timestamp ONLY when switching to paid
      if (body.status === "paid" && existing.status !== "paid") {
        data.paidAt = new Date();
      }
    }

    const updated = await prisma.employeePayroll.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PAYROLL PATCH ERROR:", err);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}