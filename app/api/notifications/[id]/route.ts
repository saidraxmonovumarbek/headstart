import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const notifications = await prisma.notification.findMany({
    where: { userId: params.id, read: false },
  });

  return NextResponse.json(notifications);
}