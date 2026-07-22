import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user: dbUser };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const { name, sku, description, image, price, cost, stock, lowStockAt, category, isActive } = body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    if (sku && sku.trim().toUpperCase() !== existing.sku) {
      const skuTaken = await prisma.product.findUnique({ where: { sku: sku.trim().toUpperCase() } });
      if (skuTaken) return NextResponse.json({ error: "SKU is already taken." }, { status: 409 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (sku !== undefined) data.sku = sku.trim().toUpperCase();
    if (description !== undefined) data.description = description?.trim() || null;
    if (image !== undefined) data.image = image?.trim() || null;
    if (price !== undefined) data.price = parseFloat(price) || 0;
    if (cost !== undefined) data.cost = parseFloat(cost) || 0;
    if (stock !== undefined) data.stock = parseInt(stock) || 0;
    if (lowStockAt !== undefined) data.lowStockAt = parseInt(lowStockAt) || 5;
    if (category !== undefined) data.category = category?.trim() || null;
    if (isActive !== undefined) data.isActive = isActive;

    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
