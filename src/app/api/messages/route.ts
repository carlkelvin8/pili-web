import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/messages?conversationId=xxx - Get messages for a conversation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required" },
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

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      isRead: false,
    },
    data: { isRead: true },
  });

  return NextResponse.json(messages);
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content, conversationId, senderEmail, senderRole } = body;

  if (!content || !conversationId || !senderEmail) {
    return NextResponse.json(
      { error: "Content, conversationId, and senderEmail are required" },
      { status: 400 }
    );
  }

  // Find sender
  let sender = await prisma.user.findUnique({
    where: { email: senderEmail },
  });

  if (!sender) {
    // Auto-create user for customer messages
    sender = await prisma.user.create({
      data: {
        email: senderEmail,
        name: senderEmail.split("@")[0],
        role: senderRole === "ADMIN" ? "ADMIN" : "CUSTOMER",
      },
    });
  }

  const message = await prisma.message.create({
    data: {
      content,
      conversationId,
      senderId: sender.id,
    },
    include: {
      sender: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(message, { status: 201 });
}
