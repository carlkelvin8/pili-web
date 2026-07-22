import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const faq = await prisma.fAQ.findUnique({ where: { id } });
    if (!faq) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ faq });
  } catch {
    return NextResponse.json({ error: "Failed to load FAQ" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.question !== undefined) data.question = body.question.trim();
    if (body.answer !== undefined) data.answer = body.answer.trim();
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const faq = await prisma.fAQ.update({ where: { id }, data });
    return NextResponse.json({ faq });
  } catch {
    return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.fAQ.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}
