import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/*
CREATE SECTION
*/
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const section = await prisma.practiceSection.create({
      data: {
        testId: body.testId,
        title: body.title || "New Section",
        order: body.order ?? 0,
        content: body.content || {
          passages: [],
          questions: [],
          audioUrl: "",
        },
      },
    });

    return NextResponse.json(section);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}