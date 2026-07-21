import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ unread: 0 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") return NextResponse.json({ unread: 0 });

    const unreadConversations = await prisma.conversation.findMany({
      where: {
        messages: { some: { isRead: false, sender: { role: "CUSTOMER" } } },
      },
      include: {
        customer: { select: { name: true, email: true } },
        messages: {
          where: { isRead: false, sender: { role: "CUSTOMER" } },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      unread: unreadConversations.length,
      conversations: unreadConversations.map((c) => ({
        id: c.id,
        subject: c.subject,
        customer: c.customer.name || c.customer.email,
        lastMessage: c.messages[0]?.content || "",
        timestamp: c.messages[0]?.createdAt || c.updatedAt,
      })),
    });
  } catch {
    return NextResponse.json({ unread: 0 });
  }
}
