import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/*
GET SINGLE TEST
*/
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const test = await prisma.practiceTest.findUnique({
    where: { id },
    include: { sections: true },
  });

  return NextResponse.json(test);
}

/*
DELETE TEST
*/
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await prisma.practiceTest.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}