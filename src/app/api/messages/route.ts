import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "No conversation selected. Please choose a conversation first." },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    await prisma.message.updateMany({
      where: { conversationId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json(
      { error: "We couldn't load your messages right now. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationId, senderEmail, senderRole } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Please type a message before sending." },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "No conversation selected. Please open a conversation first." },
        { status: 400 }
      );
    }

    if (!senderEmail) {
      return NextResponse.json(
        { error: "Your session has expired. Please refresh the page." },
        { status: 400 }
      );
    }

    let sender = await prisma.user.findUnique({ where: { email: senderEmail } });

    if (!sender) {
      sender = await prisma.user.create({
        data: {
          email: senderEmail,
          name: senderEmail.split("@")[0],
          role: senderRole === "ADMIN" ? "ADMIN" : "CUSTOMER",
        },
      });
    }

    const message = await prisma.message.create({
      data: { content: content.trim(), conversationId, senderId: sender.id },
      include: { sender: { select: { id: true, name: true, email: true, role: true } } },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Your message couldn't be sent. Please check your connection and try again." },
      { status: 500 }
    );
  }
}
