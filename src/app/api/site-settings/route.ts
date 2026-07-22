import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const DEFAULTS: Record<string, unknown> = {
  businessName: "Pili AdheSeal Inc.",
  tagline: "Industrial Sealants & Adhesives",
  phone: "+63 (2) 8888-8888",
  email: "info@piliadheseal.com",
  address: "Philippines",
  facebook: "",
  instagram: "",
  linkedin: "",
};

export async function GET() {
  try {
    const rows = await prisma.siteSettings.findMany();
    const settings: Record<string, unknown> = { ...DEFAULTS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ settings: DEFAULTS });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updates: Array<{ key: string; value: Prisma.InputJsonValue }> = [];

    for (const [key, value] of Object.entries(body)) {
      updates.push({ key, value: value as Prisma.InputJsonValue });
    }

    await Promise.all(
      updates.map((u) =>
        prisma.siteSettings.upsert({
          where: { key: u.key },
          update: { value: u.value },
          create: { key: u.key, value: u.value },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
