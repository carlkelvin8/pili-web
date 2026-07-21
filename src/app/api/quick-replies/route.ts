import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { admin: dbUser };
}

export async function GET() {
  try {
    const replies = await prisma.quickReply.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(replies);
  } catch {
    return NextResponse.json({ error: "Failed to load quick replies." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const { shortcut, label, content } = body;
    if (!shortcut?.trim() || !label?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Shortcut, label, and content are required." }, { status: 400 });
    }

    const reply = await prisma.quickReply.create({
      data: { shortcut: shortcut.trim(), label: label.trim(), content: content.trim() },
    });

    await prisma.activityLog.create({
      data: { action: "QUICK_REPLY_CREATED", details: { shortcut: reply.shortcut, label: reply.label }, adminEmail: auth.admin.email! },
    });

    return NextResponse.json(reply, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create quick reply." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required." }, { status: 400 });

    const reply = await prisma.quickReply.findUnique({ where: { id } });
    if (!reply) return NextResponse.json({ error: "Not found." }, { status: 404 });

    await prisma.quickReply.delete({ where: { id } });

    await prisma.activityLog.create({
      data: { action: "QUICK_REPLY_DELETED", details: { shortcut: reply.shortcut }, adminEmail: auth.admin.email! },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete quick reply." }, { status: 500 });
  }
}
