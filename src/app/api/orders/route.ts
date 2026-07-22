import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `PAD-${y}${m}${d}-${rand}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { shippingName: { contains: search, mode: "insensitive" } },
        { trackingNumber: { contains: search, mode: "insensitive" } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          customer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { shippingName, shippingPhone, shippingAddress, shippingCity, shippingProvince, shippingZip, notes, items } = body;

    if (!shippingName || !shippingPhone || !shippingAddress || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let customerId: string | null = null;
    if (user) {
      const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
      customerId = currentUser?.id ?? null;
    }

    let subtotal = 0;
    const orderItems: Array<{ productId: string; name: string; sku: string; price: number; quantity: number; total: number }> = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });

      const qty = parseInt(item.quantity);
      const lineTotal = product.price * qty;
      subtotal += lineTotal;
      orderItems.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: qty,
        total: lineTotal,
      });
    }

    const shippingFee = parseFloat(body.shippingFee || "0");
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: customerId || undefined,
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity: shippingCity || null,
        shippingProvince: shippingProvince || null,
        shippingZip: shippingZip || null,
        notes: notes || null,
        subtotal,
        shippingFee,
        totalAmount: subtotal + shippingFee,
        items: { create: orderItems },
      },
      include: { items: true, customer: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
