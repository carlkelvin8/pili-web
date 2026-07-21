import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    if (section) {
      const record = await prisma.pageContent.findUnique({ where: { section } });
      if (!record) return NextResponse.json({ content: null });
      return NextResponse.json({ section: record.section, content: record.content });
    }

    const all = await prisma.pageContent.findMany();
    return NextResponse.json(all.map((r) => ({ section: r.section, content: r.content })));
  } catch {
    return NextResponse.json(
      { error: "We couldn't load the page content. Please try again." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to edit page content." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { section, content } = body;

    if (!section) {
      return NextResponse.json(
        { error: "No section specified. Please select a section to edit." },
        { status: 400 }
      );
    }

    const validSections = ["hero", "about", "products", "news", "contact", "footer"];
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: `"${section}" is not a valid page section.` },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "object") {
      return NextResponse.json(
        { error: "The content you submitted is not valid. Please check your inputs." },
        { status: 400 }
      );
    }

    const record = await prisma.pageContent.upsert({
      where: { section },
      update: { content },
      create: { section, content },
    });

    return NextResponse.json({ section: record.section, content: record.content });
  } catch {
    return NextResponse.json(
      { error: "We couldn't save your changes. Please try again." },
      { status: 500 }
    );
  }
}
