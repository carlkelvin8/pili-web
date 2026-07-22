import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");
    const email = searchParams.get("email");

    if (!orderNumber) {
      return NextResponse.json({ error: "Order number is required" }, { status: 400 });
    }

    const where: Record<string, unknown> = { orderNumber: orderNumber.toUpperCase() };

    if (email) {
      where.customer = { email: { equals: email, mode: "insensitive" } };
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: { select: { name: true, sku: true, price: true, quantity: true, total: true } },
        customer: { select: { email: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        shippingName: order.shippingName,
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingProvince: order.shippingProvince,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        totalAmount: order.totalAmount,
        trackingNumber: order.trackingNumber,
        courier: order.courier,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        completedAt: order.completedAt,
        cancelledAt: order.cancelledAt,
        cancelReason: order.cancelReason,
        createdAt: order.createdAt,
        items: order.items,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to look up order" }, { status: 500 });
  }
}
