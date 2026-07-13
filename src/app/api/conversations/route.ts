import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET /api/conversations - List conversations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerEmail = searchParams.get("email");

  // Admin check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Admin sees all conversations
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser?.role === "ADMIN") {
      const conversations = await prisma.conversation.findMany({
        include: {
          customer: { select: { id: true, name: true, email: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { sender: { select: { name: true, role: true } } },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
      return NextResponse.json(conversations);
    }
  }

  // Customer sees their own conversations by email
  if (customerEmail) {
    const customer = await prisma.user.findUnique({
      where: { email: customerEmail },
    });
    if (!customer) return NextResponse.json([]);

    const conversations = await prisma.conversation.findMany({
      where: { customerId: customer.id },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: { name: true, role: true } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(conversations);
  }

  return NextResponse.json([]);
}

// POST /api/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { subject, customerName, customerEmail } = body;

  if (!subject || !customerName || !customerEmail) {
    return NextResponse.json(
      { error: "Subject, name, and email are required" },
      { status: 400 }
    );
  }

  // Find or create customer user
  let customer = await prisma.user.findUnique({
    where: { email: customerEmail },
  });

  if (!customer) {
    customer = await prisma.user.create({
      data: {
        email: customerEmail,
        name: customerName,
        role: "CUSTOMER",
      },
    });
  }

  const conversation = await prisma.conversation.create({
    data: {
      subject,
      customerId: customer.id,
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}

// PATCH /api/conversations - Update conversation status
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "ID and status are required" },
      { status: 400 }
    );
  }

  const conversation = await prisma.conversation.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(conversation);
}
