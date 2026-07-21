import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { messageId, emoji, userEmail } = body;

    if (!messageId || !emoji) {
      return NextResponse.json({ error: "Message ID and emoji are required." }, { status: 400 });
    }

    let dbUser;
    if (user) {
      dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    } else if (userEmail) {
      dbUser = await prisma.user.findUnique({ where: { email: userEmail } });
    }

    if (!dbUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const existing = await prisma.reaction.findFirst({
      where: { messageId, emoji, userId: dbUser.id },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ removed: true });
    }

    const reaction = await prisma.reaction.create({
      data: { messageId, emoji, userId: dbUser.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(reaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to process reaction." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");
    if (!messageId) return NextResponse.json({ error: "Message ID is required." }, { status: 400 });

    const reactions = await prisma.reaction.findMany({
      where: { messageId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(reactions);
  } catch {
    return NextResponse.json({ error: "Failed to load reactions." }, { status: 500 });
  }
}
