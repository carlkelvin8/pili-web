import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  if (section) {
    const record = await prisma.pageContent.findUnique({ where: { section } });
    if (!record) return NextResponse.json({ content: null });
    return NextResponse.json({ section: record.section, content: record.content });
  }

  const all = await prisma.pageContent.findMany();
  return NextResponse.json(
    all.map((r) => ({ section: r.section, content: r.content }))
  );
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { section, content } = body;
  if (!section || !content) {
    return NextResponse.json({ error: "section and content required" }, { status: 400 });
  }

  const record = await prisma.pageContent.upsert({
    where: { section },
    update: { content },
    create: { section, content },
  });

  return NextResponse.json({ section: record.section, content: record.content });
}
