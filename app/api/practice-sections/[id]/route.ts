import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/*
UPDATE SECTION CONTENT
*/
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const section = await prisma.practiceSection.update({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  await prisma.practiceSection.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ ok: true });
}