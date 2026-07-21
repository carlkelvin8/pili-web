import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: {
        conversations: {
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { content: true, createdAt: true },
            },
            _count: { select: { messages: true } },
          },
          orderBy: { updatedAt: "desc" },
        },
        _count: { select: { conversations: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      createdAt: c.createdAt,
      totalConversations: c._count.conversations,
      totalMessages: c.conversations.reduce((sum, conv) => sum + conv._count.messages, 0),
      lastActivity: c.conversations[0]?.updatedAt || c.createdAt,
      lastMessage: c.conversations[0]?.messages[0]?.content || null,
      conversations: c.conversations.map((conv) => ({
        id: conv.id,
        subject: conv.subject,
        status: conv.status,
        messageCount: conv._count.messages,
        updatedAt: conv.updatedAt,
      })),
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to load customers." }, { status: 500 });
  }
}
