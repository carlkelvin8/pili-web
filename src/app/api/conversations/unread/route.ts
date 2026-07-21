import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ count: 0 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.message.count({
    where: {
      isRead: false,
      sender: { role: "CUSTOMER" },
    },
  });

  return NextResponse.json({ count });
}