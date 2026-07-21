import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q") || "";
  if (!q.trim()) return NextResponse.json([]);

  const query = q.trim();
  const take = 5;

  const [customers, conversations, cmsPages] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take,
      select: { id: true, name: true, email: true },
    }),
    prisma.conversation.findMany({
      where: {
        OR: [
          { subject: { contains: query, mode: "insensitive" } },
          { customer: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      take,
      include: { customer: { select: { name: true, email: true } } },
    }),
    prisma.pageContent.findMany({
      where: {
        content: { path: ["$"], string_contains: query },
      },
      take,
    }),
  ]);

  const results = [
    ...customers.map((c) => ({
      type: "customer" as const,
      id: c.id,
      title: c.name || c.email,
      subtitle: c.name ? c.email : "Customer",
      href: `/admin/customers`,
    })),
    ...conversations.map((c) => ({
      type: "conversation" as const,
      id: c.id,
      title: c.subject,
      subtitle: `${c.customer.name || c.customer.email} · ${c.status}`,
      href: `/admin/messages?conversation=${c.id}`,
    })),
    ...cmsPages.map((p) => ({
      type: "cms" as const,
      id: p.section,
      title: p.section.charAt(0).toUpperCase() + p.section.slice(1),
      subtitle: "CMS Page",
      href: `/admin/cms`,
    })),
  ];

  return NextResponse.json(results.slice(0, 10));
}
