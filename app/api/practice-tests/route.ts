import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * CREATE PRACTICE TEST
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const test = await prisma.practiceTest.create({
      data: {
        title: body.title,
        type: body.type,
        difficulty: body.difficulty,
        duration: Number(body.duration) || 60,
      },
    });

    return NextResponse.json(test);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

/**
 * GET ALL TESTS
 */
export async function GET() {
  try {
    const tests = await prisma.practiceTest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tests);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}