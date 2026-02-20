import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET SINGLE TEST
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const test = await prisma.practiceTest.findUnique({
      where: { id: params.id },
    });

    if (!test) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(test);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

/**
 * DELETE TEST
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.practiceTest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}