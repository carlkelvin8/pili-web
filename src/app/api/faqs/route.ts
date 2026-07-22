import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("active");
    const isAdmin = searchParams.get("admin") === "true";

    const where: Record<string, unknown> = {};

    if (isActive === "true") {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { question: { contains: search, mode: "insensitive" } },
        { answer: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isAdmin) {
      const faqs = await prisma.fAQ.findMany({ where, orderBy: { sortOrder: "asc" } });
      return NextResponse.json({ faqs });
    }

    const faqs = await prisma.fAQ.findMany({
      where: { ...where, isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ faqs });
  } catch {
    return NextResponse.json({ error: "Failed to load FAQs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, answer, sortOrder, isActive } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
    }

    const maxOrder = await prisma.fAQ.aggregate({ _max: { sortOrder: true } });

    const faq = await prisma.fAQ.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        sortOrder: sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ faq }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}
