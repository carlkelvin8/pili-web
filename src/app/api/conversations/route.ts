import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerEmail = searchParams.get("email");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
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
            _count: {
              select: {
                messages: { where: { isRead: false, sender: { role: "CUSTOMER" } } },
              },
            },
          },
          orderBy: { updatedAt: "desc" },
        });
        return NextResponse.json(
          conversations.map((c) => ({ ...c, unreadCount: c._count.messages }))
        );
      }
    }

    if (customerEmail) {
      const customer = await prisma.user.findUnique({ where: { email: customerEmail } });
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
  } catch {
    return NextResponse.json(
      { error: "We couldn't load conversations right now. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, customerName, customerEmail } = body;

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: "Please enter a subject for your inquiry." },
        { status: 400 }
      );
    }

    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 }
      );
    }

    if (!customerEmail || !customerEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    let customer = await prisma.user.findUnique({ where: { email: customerEmail } });
    if (!customer) {
      customer = await prisma.user.create({
        data: { email: customerEmail, name: customerName, role: "CUSTOMER" },
      });
    }

    const conversation = await prisma.conversation.create({
      data: { subject: subject.trim(), customerId: customer.id },
      include: { customer: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "We couldn't create your inquiry right now. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to perform this action." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "No conversation selected." },
        { status: 400 }
      );
    }

    if (!status || !["OPEN", "PENDING", "CLOSED"].includes(status)) {
      return NextResponse.json(
        { error: "Please select a valid status (Open, Pending, or Closed)." },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json(
      { error: "We couldn't update the status. Please try again." },
      { status: 500 }
    );
  }
}
