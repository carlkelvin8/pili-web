import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to register." }, { status: 401 });
    }

    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "Please provide your name and email." }, { status: 400 });
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN", name },
      });
      return NextResponse.json(updatedUser);
    }

    const newUser = await prisma.user.create({
      data: { id: user.id, email, name, role: "ADMIN" },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "We couldn't create your account right now. Please try again later." },
      { status: 500 }
    );
  }
}
