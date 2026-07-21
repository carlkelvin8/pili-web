import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { conversationId, name } = body;
    if (!conversationId) return NextResponse.json({ error: "conversationId required." }, { status: 400 });

    const channel = supabase.channel(`typing-${conversationId}`);
    await channel.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: user.id, name: name || user.email, conversationId },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
