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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get("active") === "true";

    if (!publicOnly) {
      const auth = await requireAdmin();
      if ("error" in auth) return auth.error;
    }

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const lowStock = searchParams.get("lowStock") === "true";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (publicOnly) where.isActive = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.category = category;
    if (lowStock) where.stock = { lte: prisma.product.fields.lowStockAt };

    const products = await prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    const categories = await prisma.product.findMany({
      select: { category: true },
      where: { category: { not: null } },
      distinct: ["category"],
    });

    return NextResponse.json({
      products,
      categories: categories.map((c) => c.category).filter(Boolean),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load products." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const { name, sku, description, price, cost, stock, lowStockAt, category } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    if (!sku?.trim()) return NextResponse.json({ error: "SKU is required." }, { status: 400 });

    const existing = await prisma.product.findUnique({ where: { sku: sku.trim().toUpperCase() } });
    if (existing) return NextResponse.json({ error: "A product with this SKU already exists." }, { status: 409 });

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description?.trim() || null,
        price: parseFloat(price) || 0,
        cost: parseFloat(cost) || 0,
        stock: parseInt(stock) || 0,
        lowStockAt: parseInt(lowStockAt) || 5,
        category: category?.trim() || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
