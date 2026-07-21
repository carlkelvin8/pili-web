import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, email, name } = body;

  if (!userId || !email || !name) {
    return NextResponse.json(
      { error: "userId, email, and name are required" },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (existingUser) {
    // Update existing user to ADMIN role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN", name },
    });
    return NextResponse.json(updatedUser);
  }

  // Create new admin user
  const user = await prisma.user.create({
    data: {
      id: userId,
      email,
      name,
      role: "ADMIN",
    },
  });

  return NextResponse.json(user, { status: 201 });
}