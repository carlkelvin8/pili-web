import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, customer: { select: { id: true, name: true, email: true } } },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "STAFF")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};

    const allowedStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED", "CANCELLED", "RETURNED"];

    if (body.status !== undefined) {
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.status = body.status;

      const now = new Date();
      if (body.status === "SHIPPED") data.shippedAt = now;
      if (body.status === "DELIVERED") data.deliveredAt = now;
      if (body.status === "COMPLETED") data.completedAt = now;
      if (body.status === "CANCELLED") {
        data.cancelledAt = now;
        if (body.cancelReason) data.cancelReason = body.cancelReason;
      }
    }

    if (body.trackingNumber !== undefined) data.trackingNumber = body.trackingNumber || null;
    if (body.courier !== undefined) data.courier = body.courier || null;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.shippingName !== undefined) data.shippingName = body.shippingName;
    if (body.shippingPhone !== undefined) data.shippingPhone = body.shippingPhone;
    if (body.shippingAddress !== undefined) data.shippingAddress = body.shippingAddress;
    if (body.shippingCity !== undefined) data.shippingCity = body.shippingCity;
    if (body.shippingProvince !== undefined) data.shippingProvince = body.shippingProvince;
    if (body.shippingZip !== undefined) data.shippingZip = body.shippingZip;
    if (body.shippingFee !== undefined) {
      data.shippingFee = parseFloat(body.shippingFee);
      const order = await prisma.order.findUnique({ where: { id }, select: { subtotal: true } });
      if (order) data.totalAmount = order.subtotal + parseFloat(body.shippingFee);
    }

    const order = await prisma.order.update({
      where: { id },
      data,
      include: { items: true, customer: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
