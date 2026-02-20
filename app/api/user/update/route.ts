import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, password, image } = body;

    const updateData: any = {};

    // Only update fields if they exist
    if (typeof name === "string") {
      updateData.name = name.trim();
    }

    if (typeof email === "string") {
      const trimmedEmail = email.trim();

      // Check if email already belongs to someone else
      const existingUser = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });

      if (
        existingUser &&
        existingUser.id !== session.user.id
      ) {
        return NextResponse.json(
          { error: "Email already in use." },
          { status: 400 }
        );
      }

      updateData.email = trimmedEmail;
    }

    if (typeof image === "string" || image === null) {
      updateData.image = image;
    }

    // Get current user from database (needed for password comparison)
const currentUser = await prisma.user.findUnique({
  where: { id: session.user.id },
});

    if (typeof password === "string" && password.length > 0) {

  if (!currentUser) {
    return NextResponse.json(
      { error: "User not found." },
      { status: 404 }
    );
  }

  // 🔥 Check if new password equals old password
  const isSamePassword = await bcrypt.compare(
    password,
    currentUser.password
  );

  if (isSamePassword) {
    return NextResponse.json(
      { error: "New password cannot be your current password." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  updateData.password = hashedPassword;
}

    // If nothing changed, just return current session data
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
    });

  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}