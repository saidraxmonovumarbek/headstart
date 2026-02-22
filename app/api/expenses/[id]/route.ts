import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/* ================= DELETE ================= */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    console.log("DELETE ID:", id);

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE API CRASH:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

/* ================= PATCH (EDIT) ================= */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const title = body.title ?? existing.title;
    const amount =
      body.amount !== undefined ? Number(body.amount) : existing.amount;

    if (Number.isNaN(amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        title,
        amount,
        month: existing.month, // ⭐ preserve month explicitly
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH API CRASH:", err);
    return NextResponse.json({ error: "Patch failed" }, { status: 500 });
  }
}