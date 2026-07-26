import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const PREVIEW_COOKIE = "cms_preview_mode";
const PREVIEW_SECRET = process.env.CMS_PREVIEW_SECRET ?? "preview-secret";

export async function POST(request: NextRequest) {
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
        { error: "You don't have permission to use preview mode." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { enable } = body;

    const cookieStore = await cookies();

    if (enable) {
      cookieStore.set(PREVIEW_COOKIE, PREVIEW_SECRET, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60, // 1 hour
        path: "/",
      });
      return NextResponse.json({ previewMode: true });
    } else {
      cookieStore.delete(PREVIEW_COOKIE);
      return NextResponse.json({ previewMode: false });
    }
  } catch {
    return NextResponse.json(
      { error: "Unable to toggle preview mode." },
      { status: 500 }
    );
  }
}
