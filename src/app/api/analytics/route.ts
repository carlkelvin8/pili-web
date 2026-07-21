import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalConversations,
      totalMessages,
      statusCounts,
      conversations12m,
      totalCustomers,
      newCustomersThisMonth,
      newCustomersLastMonth,
      unreadMessages,
      conversationsThisMonth,
      conversationsLastMonth,
      messagesThisMonth,
      messagesLastMonth,
      allConversations,
      recentMessages,
      messages30d,
      messages60d,
    ] = await Promise.all([
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.conversation.groupBy({ by: ["status"], _count: true }),
      prisma.conversation.findMany({
        where: { createdAt: { gte: twelveMonthsAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: thisMonthStart } } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
      prisma.message.count({ where: { isRead: false } }),
      prisma.conversation.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.conversation.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
      prisma.message.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.message.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
      prisma.conversation.findMany({
        select: {
          id: true,
          subject: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          customer: { select: { name: true, email: true } },
          messages: {
            select: { id: true, senderId: true, createdAt: true, sender: { select: { role: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      }),
      prisma.message.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          sender: { select: { name: true, email: true, role: true } },
          conversation: { select: { id: true, subject: true } },
        },
      }),
      prisma.message.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
      }),
      prisma.message.findMany({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        select: { createdAt: true },
      }),
    ]);

    // Monthly inquiries (12 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData: Record<string, { month: string; inquiries: number; messages: number }> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { month: `${monthNames[d.getMonth()]} ${String(d.getMonth() + 1).padStart(2, "0")}`, inquiries: 0, messages: 0 };
    }

    for (const c of conversations12m) {
      const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key]) monthlyData[key].inquiries++;
    }

    // Messages per month
    const msgs12m = await prisma.message.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    });
    for (const m of msgs12m) {
      const key = `${m.createdAt.getFullYear()}-${String(m.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key]) monthlyData[key].messages++;
    }

    // Status breakdown
    const statusMap: Record<string, number> = {};
    for (const s of statusCounts) statusMap[s.status] = s._count;

    // Trend percentages
    function trend(current: number, previous: number): number {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    }

    // Response rate: conversations with at least one admin message
    const conversationsWithAdminReply = allConversations.filter((c) =>
      c.messages.some((m) => m.sender.role === "ADMIN")
    ).length;
    const responseRate = totalConversations > 0 ? Math.round((conversationsWithAdminReply / totalConversations) * 100) : 0;

    // Avg messages per conversation
    const avgMessagesPerConv = totalConversations > 0 ? (totalMessages / totalConversations).toFixed(1) : "0";

    // Daily messages (last 30 days)
    const dailyMessages: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      dailyMessages[key] = 0;
    }
    for (const m of messages30d) {
      const key = m.createdAt.toISOString().split("T")[0];
      if (dailyMessages[key] !== undefined) dailyMessages[key]++;
    }
    const dailyMessagesArr = Object.entries(dailyMessages).map(([date, count]) => {
      const d = new Date(date + "T00:00:00");
      return { date: `${monthNames[d.getMonth()]} ${d.getDate()}`, count };
    });

    // Day of week distribution
    const dayOfWeekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
    for (const m of messages30d) dayOfWeekCounts[m.createdAt.getDay()]++;
    const dayOfWeekData = dayOfWeekNames.map((name, i) => ({ day: name, messages: dayOfWeekCounts[i] }));

    // Hour of day distribution
    const hourCounts = new Array(24).fill(0);
    for (const m of messages30d) hourCounts[m.createdAt.getHours()]++;
    const hourlyData = hourCounts.map((count, hour) => ({
      hour: `${String(hour).padStart(2, "0")}:00`,
      messages: count,
    }));

    // Top customers by message count
    const customerMessageCounts: Record<string, { name: string; email: string; count: number }> = {};
    for (const conv of allConversations) {
      const custMsgs = conv.messages.filter((m) => m.sender.role === "CUSTOMER").length;
      if (custMsgs > 0) {
        const key = conv.customer.email;
        if (!customerMessageCounts[key]) {
          customerMessageCounts[key] = { name: conv.customer.name || "Unknown", email: conv.customer.email, count: 0 };
        }
        customerMessageCounts[key].count += custMsgs;
      }
    }
    const topCustomers = Object.values(customerMessageCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Message volume (30d vs prev 30d)
    const messages30dCount = messages30d.length;
    const messages60dPrevCount = messages60d.length;
    const msgTrend = trend(messages30dCount, messages60dPrevCount);

    // Recent activity
    const recentActivity = recentMessages.map((m) => ({
      id: m.id,
      content: m.content.length > 80 ? m.content.slice(0, 80) + "..." : m.content,
      createdAt: m.createdAt.toISOString(),
      sender: m.sender.name || m.sender.email.split("@")[0],
      role: m.sender.role,
      conversationSubject: m.conversation.subject,
      conversationId: m.conversation.id,
    }));

    // Conversions: conversations that became closed
    const closedCount = statusMap["CLOSED"] || 0;
    const conversionRate = totalConversations > 0 ? Math.round((closedCount / totalConversations) * 100) : 0;

    // Peak hour
    const peakHourIdx = hourCounts.indexOf(Math.max(...hourCounts));
    const peakHour = `${peakHourIdx}:00–${peakHourIdx + 1}:00`;

    return NextResponse.json({
      totalConversations,
      totalMessages,
      totalCustomers,
      unreadMessages,
      statusBreakdown: statusMap,
      monthlyInquiries: Object.values(monthlyData),
      responseRate,
      avgMessagesPerConv: parseFloat(avgMessagesPerConv),
      conversationsThisMonth,
      conversationsLastMonth,
      conversationsTrend: trend(conversationsThisMonth, conversationsLastMonth),
      messagesThisMonth,
      messagesLastMonth,
      messagesTrend: trend(messagesThisMonth, messagesLastMonth),
      newCustomersThisMonth,
      newCustomersLastMonth,
      customersTrend: trend(newCustomersThisMonth, newCustomersLastMonth),
      unreadTrend: msgTrend,
      dailyMessages: dailyMessagesArr,
      dayOfWeekData,
      hourlyData,
      topCustomers,
      recentActivity,
      conversionRate,
      peakHour,
    });
  } catch {
    return NextResponse.json(
      { error: "We couldn't load analytics data. Please try again." },
      { status: 500 }
    );
  }
}
