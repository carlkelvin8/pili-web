import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin/messages";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Upsert user in our database
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email ?? "",
            name: user.user_metadata?.full_name ?? user.email?.split("@")[0],
          },
          create: {
            id: user.id,
            email: user.email ?? "",
            name: user.user_metadata?.full_name ?? user.email?.split("@")[0],
            role: "ADMIN",
          },
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
