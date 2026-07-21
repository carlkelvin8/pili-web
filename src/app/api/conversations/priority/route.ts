import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { conversationId, priority } = body;
  if (!conversationId || !priority) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: { priority },
  });

  await prisma.activityLog.create({
    data: {
      action: "conversation.priority_changed",
      details: { conversationId, priority, subject: conversation.subject },
      adminEmail: user.email!,
    },
  });

  return NextResponse.json(conversation);
}
