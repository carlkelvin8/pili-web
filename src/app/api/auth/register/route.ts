import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, name } = body;

    if (!userId || !email || !name) {
      return NextResponse.json(
        { error: "Missing required information. Please fill in all fields." },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });

    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: "ADMIN", name },
      });
      return NextResponse.json(updatedUser);
    }

    const user = await prisma.user.create({
      data: { id: userId, email, name, role: "ADMIN" },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "We couldn't create your account right now. Please try again later." },
      { status: 500 }
    );
  }
}
