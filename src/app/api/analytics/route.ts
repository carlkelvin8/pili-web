import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  const [totalConversations, totalMessages, statusCounts, conversations] = await Promise.all([
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.conversation.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.conversation.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });

  const unreadMessages = await prisma.message.count({
    where: { isRead: false },
  });

  const monthlyData: Record<string, { inquiries: number; month: string }> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = { month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`, inquiries: 0 };
  }

  for (const c of conversations) {
    const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyData[key]) monthlyData[key].inquiries++;
  }

  const statusMap: Record<string, number> = {};
  for (const s of statusCounts) {
    statusMap[s.status] = s._count;
  }

  return NextResponse.json({
    totalConversations,
    totalMessages,
    totalCustomers,
    unreadMessages,
    statusBreakdown: statusMap,
    monthlyInquiries: Object.values(monthlyData),
  });
}
