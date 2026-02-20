import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const notifications = await prisma.notification.findMany({
    where: {
      userId: id,
      read: false,
    },
  });

  return NextResponse.json(notifications);
}