import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("start");
    const endDateParam = searchParams.get("end");

    const now = new Date();
    const endDate = endDateParam ? new Date(endDateParam) : now;
    const startDate = startDateParam ? new Date(startDateParam) : new Date(now.getFullYear() - 1, now.getMonth(), 1);

    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Lightweight counts + targeted aggregations (no fetching all rows)
    const [
      totalConversations,
      totalMessages,
      statusCounts,
      totalCustomers,
      newCustomersThisMonth,
      newCustomersLastMonth,
      unreadMessages,
      conversationsThisMonth,
      conversationsLastMonth,
      messagesThisMonth,
      messagesLastMonth,
      recentMessages,
      // Response rate: count conversations that have at least one admin reply
      convsWithAdminReply,
      // Top 8 customers by message count
      topCustomersRaw,
      // Avg response time: first admin reply - first customer message per conversation
      avgResponseTimeRaw,
      // Messages per month (12m) via aggregation
      msgsPerMonthRaw,
      // Messages 30d count for trend
      messages30dCount,
      messages60dCount,
      // Daily messages (30d) via SQL
      dailyMessagesRaw,
      // Hourly distribution (30d) via SQL
      hourlyRaw,
      // Day of week distribution (30d) via SQL
      dayOfWeekRaw,
    ] = await Promise.all([
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.conversation.groupBy({ by: ["status"], _count: true }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: thisMonthStart } } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
      prisma.message.count({ where: { isRead: false } }),
      prisma.conversation.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.conversation.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
      prisma.message.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.message.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
      prisma.message.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, content: true, createdAt: true,
          sender: { select: { name: true, email: true, role: true } },
          conversation: { select: { id: true, subject: true } },
        },
      }),
      // Response rate: conversations with at least one admin message
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT c.id) as count
        FROM "Conversation" c
        INNER JOIN "Message" m ON m."conversationId" = c.id
        INNER JOIN "User" u ON u.id = m."senderId"
        WHERE u.role = 'ADMIN'
      `,
      // Top 8 customers by customer message count
      prisma.$queryRaw<{ name: string; email: string; count: bigint }[]>`
        SELECT u.name, u.email, COUNT(m.id) as count
        FROM "Message" m
        INNER JOIN "User" u ON u.id = m."senderId"
        WHERE u.role = 'CUSTOMER'
        GROUP BY u.id, u.name, u.email
        ORDER BY count DESC
        LIMIT 8
      `,
      // Avg response time: avg(first admin reply - first customer msg) per conversation
      prisma.$queryRaw<[{ avg_ms: bigint | null }]>`
        SELECT AVG(EXTRACT(EPOCH FROM (admin_first.reply_time - cust_first.msg_time)) * 1000)::bigint as avg_ms
        FROM (
          SELECT m."conversationId", MIN(m."createdAt") as msg_time
          FROM "Message" m
          INNER JOIN "User" u ON u.id = m."senderId"
          WHERE u.role = 'CUSTOMER'
          GROUP BY m."conversationId"
        ) cust_first
        INNER JOIN (
          SELECT m."conversationId", MIN(m."createdAt") as reply_time
          FROM "Message" m
          INNER JOIN "User" u ON u.id = m."senderId"
          WHERE u.role = 'ADMIN'
          GROUP BY m."conversationId"
        ) admin_first ON cust_first."conversationId" = admin_first."conversationId"
        WHERE admin_first.reply_time > cust_first.msg_time
      `,
      // Messages per month (12m) via date truncation
      prisma.$queryRaw<{ month: string; count: bigint }[]>`
        SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, COUNT(*) as count
        FROM "Message"
        WHERE "createdAt" >= ${twelveMonthsAgo}
        GROUP BY month
        ORDER BY month ASC
      `,
      // Messages 30d count
      prisma.message.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      // Messages 30-60d count (prev 30d for trend)
      prisma.message.count({
        where: { createdAt: { gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), lt: thirtyDaysAgo } },
      }),
      // Daily messages (30d) via SQL
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, COUNT(*) as count
        FROM "Message"
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY date
        ORDER BY date ASC
      `,
      // Hourly distribution (30d) via SQL
      prisma.$queryRaw<{ hour: number; count: bigint }[]>`
        SELECT EXTRACT(HOUR FROM "createdAt")::int as hour, COUNT(*) as count
        FROM "Message"
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY hour
        ORDER BY hour ASC
      `,
      // Day of week distribution (30d) via SQL
      prisma.$queryRaw<{ dow: number; count: bigint }[]>`
        SELECT EXTRACT(DOW FROM "createdAt")::int as dow, COUNT(*) as count
        FROM "Message"
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY dow
        ORDER BY dow ASC
      `,
    ]);

    // Monthly inquiries (12 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData: Record<string, { month: string; inquiries: number; messages: number }> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { month: `${monthNames[d.getMonth()]} ${String(d.getMonth() + 1).padStart(2, "0")}`, inquiries: 0, messages: 0 };
    }

    // Populate messages per month from SQL aggregation
    for (const row of msgsPerMonthRaw) {
      if (monthlyData[row.month]) monthlyData[row.month].messages = Number(row.count);
    }

    // Status breakdown
    const statusMap: Record<string, number> = {};
    for (const s of statusCounts) statusMap[s.status] = s._count;

    // Trend percentages
    function trend(current: number, previous: number): number {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    }

    // Response rate
    const conversationsWithAdminReply = Number(convsWithAdminReply[0]?.count ?? 0);
    const responseRate = totalConversations > 0 ? Math.round((conversationsWithAdminReply / totalConversations) * 100) : 0;

    // Avg messages per conversation
    const avgMessagesPerConv = totalConversations > 0 ? (totalMessages / totalConversations).toFixed(1) : "0";

    // Daily messages (last 30 days) — fill gaps
    const dailyMap = new Map(dailyMessagesRaw.map((r) => [r.date, Number(r.count)]));
    const dailyMessages: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      dailyMessages.push({
        date: `${monthNames[d.getMonth()]} ${d.getDate()}`,
        count: dailyMap.get(key) ?? 0,
      });
    }

    // Day of week distribution
    const dayOfWeekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dowMap = new Map(dayOfWeekRaw.map((r) => [r.dow, Number(r.count)]));
    const dayOfWeekData = dayOfWeekNames.map((name, i) => ({ day: name, messages: dowMap.get(i) ?? 0 }));

    // Hourly distribution
    const hourMap = new Map(hourlyRaw.map((r) => [r.hour, Number(r.count)]));
    const hourlyData = Array.from({ length: 24 }, (_, h) => ({
      hour: `${String(h).padStart(2, "0")}:00`,
      messages: hourMap.get(h) ?? 0,
    }));

    // Top customers
    const topCustomers = topCustomersRaw.map((c) => ({
      name: c.name || "Unknown",
      email: c.email,
      count: Number(c.count),
    }));

    // Message volume trend
    const msgTrend = trend(messages30dCount, messages60dCount);

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

    // Conversions
    const closedCount = statusMap["CLOSED"] || 0;
    const conversionRate = totalConversations > 0 ? Math.round((closedCount / totalConversations) * 100) : 0;

    // Peak hour
    const peakHourObj = hourlyData.reduce((max, h) => h.messages > max.messages ? h : max, hourlyData[0]);
    const peakHourNum = parseInt(peakHourObj.hour, 10);
    const peakHour = `${peakHourNum}:00–${peakHourNum + 1}:00`;

    // Avg response time
    const avgResponseTimeMs = Number(avgResponseTimeRaw[0]?.avg_ms ?? 0);
    const avgResponseTimeMinutes = avgResponseTimeMs > 0 ? Math.round(avgResponseTimeMs / 60000) : 0;
    const responseTimeFormatted = avgResponseTimeMinutes < 60
      ? `${avgResponseTimeMinutes}m`
      : `${Math.floor(avgResponseTimeMinutes / 60)}h ${avgResponseTimeMinutes % 60}m`;

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
      dailyMessages,
      dayOfWeekData,
      hourlyData,
      topCustomers,
      recentActivity,
      conversionRate,
      peakHour,
      avgResponseTimeMinutes,
      responseTimeFormatted,
      conversationsWithResponse: conversationsWithAdminReply,
    });
  } catch {
    return NextResponse.json(
      { error: "We couldn't load analytics data. Please try again." },
      { status: 500 }
    );
  }
}
