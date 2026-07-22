import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const cursor = searchParams.get("cursor");

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
        reactions: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      ...(cursor
        ? { skip: 1, cursor: { id: cursor } }
        : {}),
    });

    // Mark as read in background — don't block the response
    prisma.message.updateMany({
      where: { conversationId, isRead: false },
      data: { isRead: true },
    }).catch(() => {});

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { content, conversationId, senderEmail, senderRole, attachmentUrl, attachmentName } = body;

    if (!content?.trim() && !attachmentUrl) {
      return NextResponse.json(
        { error: "Please type a message or attach a file." },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "No conversation selected. Please open a conversation first." },
        { status: 400 }
      );
    }

    let sender;
    if (user) {
      sender = await prisma.user.findUnique({ where: { id: user.id } });
    } else if (senderEmail) {
      sender = await prisma.user.findUnique({ where: { email: senderEmail } });
      if (!sender) {
        sender = await prisma.user.create({
          data: {
            email: senderEmail,
            name: senderEmail.split("@")[0],
            role: senderRole === "ADMIN" ? "ADMIN" : "CUSTOMER",
          },
        });
      }
    }

    if (!sender) {
      return NextResponse.json({ error: "Your session has expired. Please refresh the page." }, { status: 401 });
    }

    const message = await prisma.message.create({
      data: {
        content: content?.trim() || "",
        conversationId,
        senderId: sender.id,
        ...(attachmentUrl && { attachmentUrl, attachmentName: attachmentName || null }),
      },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        reactions: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    // Fire-and-forget: update conversation timestamp for sort ordering
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }).catch(() => {});

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Your message couldn't be sent. Please check your connection and try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { id, content, userEmail } = body;

    if (!id || !content || !content.trim()) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    let sender;
    if (user) {
      sender = await prisma.user.findUnique({ where: { id: user.id } });
    } else if (userEmail) {
      sender = await prisma.user.findUnique({ where: { email: userEmail } });
    }

    if (!sender) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });

    if (message.senderId !== sender.id) {
      return NextResponse.json({ error: "You can only edit your own messages." }, { status: 403 });
    }

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (message.createdAt < fiveMinAgo) {
      return NextResponse.json({ error: "Messages can only be edited within 5 minutes of sending." }, { status: 403 });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { content: content.trim(), editedAt: new Date() },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        reactions: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "We couldn't edit the message. Please try again." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userEmail = searchParams.get("userEmail");

    if (!id) return NextResponse.json({ error: "Message ID is required." }, { status: 400 });

    let sender;
    if (user) {
      sender = await prisma.user.findUnique({ where: { id: user.id } });
    } else if (userEmail) {
      sender = await prisma.user.findUnique({ where: { email: userEmail } });
    }

    if (!sender) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });

    if (message.senderId !== sender.id) {
      return NextResponse.json({ error: "You can only unsend your own messages." }, { status: 403 });
    }

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (message.createdAt < fiveMinAgo) {
      return NextResponse.json({ error: "Messages can only be unsent within 5 minutes of sending." }, { status: 403 });
    }

    await prisma.message.delete({ where: { id } });

    await prisma.conversation.update({
      where: { id: message.conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "We couldn't delete the message. Please try again." }, { status: 500 });
  }
}
