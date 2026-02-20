import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// UPDATE EVENT
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const body = await req.json();

const existing = await prisma.event.findUnique({
  where: { id },
});


if (!existing) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

const userId = (session.user as any).id;
const role = (session.user as any).role;

// Only admin can modify global events
if (existing.isGlobal && role !== "admin") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Non-admin users can only modify their own events
if (!existing.isGlobal && existing.creatorId !== userId) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

const now = new Date();
const eventDate = new Date(existing.startTime);
const diffMs = now.getTime() - eventDate.getTime();
const diffDays = diffMs / (1000 * 60 * 60 * 24);

if (diffDays >= 2 && eventDate < now) {
  return NextResponse.json(
    { error: "Editing window expired" },
    { status: 403 }
  );
}

    const updated = await prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        type: body.type,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT ERROR FULL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE EVENT
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const existing = await prisma.event.findUnique({
  where: { id },
});

if (!existing) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

const userId = (session.user as any).id;
const role = (session.user as any).role;

// Only admin can delete global events
if (existing.isGlobal && role !== "admin") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Non-admin users can only delete their own events
if (!existing.isGlobal && existing.creatorId !== userId) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

const now = new Date();
const eventDate = new Date(existing.startTime);
const diffMs = now.getTime() - eventDate.getTime();
const diffDays = diffMs / (1000 * 60 * 60 * 24);

if (diffDays >= 2 && eventDate < now) {
  return NextResponse.json(
    { error: "Editing window expired" },
    { status: 403 }
  );
}

await prisma.event.delete({
  where: { id },
});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE ERROR FULL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}