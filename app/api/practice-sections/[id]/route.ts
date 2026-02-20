import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/*
UPDATE SECTION
*/
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const section = await prisma.practiceSection.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        order: body.order,
      },
    });

    return NextResponse.json(section);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

/*
DELETE SECTION
*/
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await prisma.practiceSection.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}