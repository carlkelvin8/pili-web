import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");
    const preview = searchParams.get("preview") === "true";

    if (section) {
      const record = await prisma.pageContent.findUnique({ where: { section } });
      if (!record) return NextResponse.json({ content: null });
      return NextResponse.json({ 
        section: record.section, 
        content: record.content,
        status: record.status,
        publishedAt: record.publishedAt
      });
    }

    // For public pages, only return published content unless preview mode is enabled
    const whereClause = preview ? {} : { status: "PUBLISHED" as const };
    const all = await prisma.pageContent.findMany({ where: whereClause });
    return NextResponse.json(all.map((r) => ({ 
      section: r.section, 
      content: r.content,
      status: r.status,
      publishedAt: r.publishedAt
    })));
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
      update: { content, status: "DRAFT" },
      create: { section, content, status: "DRAFT" },
    });

    return NextResponse.json({ section: record.section, content: record.content, status: record.status, publishedAt: record.publishedAt });
  } catch {
    return NextResponse.json(
      { error: "We couldn't save your changes. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { section, action } = body;

    if (!section) {
      return NextResponse.json(
        { error: "No section specified." },
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

    if (action !== "publish" && action !== "unpublish") {
      return NextResponse.json(
        { error: `Invalid action. Must be "publish" or "unpublish".` },
        { status: 400 }
      );
    }

    const record = await prisma.pageContent.update({
      where: { section },
      data: {
        status: action === "publish" ? "PUBLISHED" : "DRAFT",
        publishedAt: action === "publish" ? new Date() : null,
      },
    });

    return NextResponse.json({ 
      section: record.section, 
      content: record.content, 
      status: record.status, 
      publishedAt: record.publishedAt 
    });
  } catch {
    return NextResponse.json(
      { error: "We couldn't update the publish status. Please try again." },
      { status: 500 }
    );
  }
}
