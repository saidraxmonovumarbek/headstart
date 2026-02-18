import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
  !session ||
  ((session.user as any).role !== "admin" &&
   !(session.user as any).isSuperAdmin)
) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    let whereClause: any = {};

if (role === "teacher") {
  whereClause = {
    OR: [
      { role: "teacher" },
      { isSuperAdmin: true },
    ],
  };
} else if (role) {
  whereClause = { role };
}

const users = await prisma.user.findMany({
  where: whereClause,
      select: {
  id: true,
  name: true,
  email: true,
  role: true,
  isSuperAdmin: true,
},
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error("USERS FETCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}