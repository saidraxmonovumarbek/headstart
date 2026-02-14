import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// GET reflection by date
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Missing date" }, { status: 400 });
  }

  const reflection = await prisma.dailyReflection.findUnique({
    where: {
      userId_date: {
        userId: (session.user as any).id,
        date,
      },
    },
  });

  return NextResponse.json(reflection || null);
}

// CREATE / UPDATE reflection
// CREATE / UPDATE reflection
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let date: string | null = null;
  let content: string | null = null;

  try {
    // Normal fetch (application/json)
    const body = await req.json();
    date = body?.date ?? null;
    content = body?.content ?? "";
  } catch {
    try {
      // sendBeacon fallback (raw text body)
      const text = await req.text();
      if (text) {
        const parsed = JSON.parse(text);
        date = parsed?.date ?? null;
        content = parsed?.content ?? "";
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
  }

  if (!date) {
    return NextResponse.json(
      { error: "Missing date" },
      { status: 400 }
    );
  }

  const userId = (session.user as any).id;

  const reflection = await prisma.dailyReflection.upsert({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
    update: {
      content: content ?? "",
    },
    create: {
      userId,
      date,
      content: content ?? "",
    },
  });

  return NextResponse.json(reflection);
}