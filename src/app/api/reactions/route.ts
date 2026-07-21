import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, emoji, userEmail } = body;

    if (!messageId || !emoji || !userEmail) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    const existing = await prisma.reaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId: user.id, emoji } },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "removed", emoji });
    }

    const reaction = await prisma.reaction.create({
      data: { messageId, userId: user.id, emoji },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ action: "added", reaction }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We couldn't process your reaction. Please try again." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");
    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required." }, { status: 400 });
    }

    const reactions = await prisma.reaction.findMany({
      where: { messageId },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json(reactions);
  } catch {
    return NextResponse.json({ error: "Failed to load reactions." }, { status: 500 });
  }
}
