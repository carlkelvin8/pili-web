"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  image: string | null;
  price: number;
  stock: number;
  category: string | null;
}

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

function formatCurrency(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const CATEGORY_CONFIG: Record<string, { gradient: string; icon: string; tagline: string }> = {
  Adhesives: { gradient: "from-emerald-900 via-emerald-800 to-teal-700", icon: "🔬", tagline: "Engineered for Unbreakable Bonds" },
  Sealants: { gradient: "from-slate-900 via-blue-900 to-indigo-800", icon: "🛡️", tagline: "Weather-Proof Protection" },
  Glue: { gradient: "from-violet-950 via-purple-900 to-fuchsia-800", icon: "✨", tagline: "Powerful Hold, Naturally Better" },
  default: { gradient: "from-[#0a2e2e] via-[#0d4d4d] to-[#1a5a4a]", icon: "🏭", tagline: "Industrial-Grade Solutions" },
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function ProductsPage() {
  const { addItem, itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [categories, setCategories] = useState<string[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(9);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const heroIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ active: "true" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filterCategory) params.set("category", filterCategory);
    fetch(`/api/products?${params}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        setProducts(Array.isArray(d.products) ? d.products : []);
        setCategories(Array.isArray(d.categories) ? d.categories : []);
        setVisibleCount(9);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch, filterCategory]);

  // Hero carousel
  useEffect(() => {
    if (products.length < 2) return;
    heroIntervalRef.current = setInterval(() => setHeroIdx((i) => (i + 1) % products.length), 6000);
    return () => { if (heroIntervalRef.current) clearInterval(heroIntervalRef.current); };
  }, [products.length]);

  // Infinite scroll
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < sortedProducts.length) {
        setVisibleCount((v) => Math.min(v + 6, sortedProducts.length));
      }
    }, { threshold: 0.1 });
    if (loadMoreRef.current) obs.observe(loadMoreRef.current);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount, products.length, sortBy]);

  // Sort products client-side
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-asc": sorted.sort((a, b) => a.price - b.price); break;
      case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
      case "name-asc": sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: break; // "newest" - already ordered by updatedAt desc from API
    }
    return sorted;
  }, [products, sortBy]);

  const addToCart = useCallback((product: Product, qty = 1) => {
    addItem({ productId: product.id, name: product.name, sku: product.sku, price: product.price, image: product.image || undefined }, qty);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  }, [addItem]);

  const heroProduct = products[heroIdx] || products[0];
  const visibleProducts = sortedProducts.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#fafcfb]">
      {/* ── Sticky Navigation ── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold text-[#0a2e2e] hover:text-[var(--color-accent)] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden md:inline font-medium">Pili AdheSeal Inc.</span>
            <button onClick={() => setCartOpen(true)}
              className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors group">
              <svg className="w-5 h-5 text-gray-600 group-hover:text-[var(--color-accent)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-accent)] text-white text-[10px] font-bold rounded-full min-w-[20px] min-h-[20px] flex items-center justify-center shadow-md">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      {!loading && heroProduct && (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0a2e2e] via-[#0d3d3d] to-[#1a5a4a]">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-accent)]/8 rounded-full blur-[200px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/3 rounded-full blur-[150px]" />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[520px] py-20">
              {/* Left: Text */}
              <div className="text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                  <span className="text-xs font-semibold text-[var(--color-accent)]">Featured Product</span>
                </div>
                {heroProduct.category && (
                  <span className="block text-xs text-white/40 uppercase tracking-[0.2em] font-medium mb-3">{heroProduct.category}</span>
                )}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] font-[family-name:var(--font-poppins)]">
                  {heroProduct.name}
                </h1>
                {heroProduct.description && (
                  <p className="mt-6 text-lg text-white/50 leading-relaxed max-w-lg line-clamp-3">{heroProduct.description}</p>
                )}
                <div className="mt-8 flex items-baseline gap-4 flex-wrap">
                  <p className="text-4xl font-bold text-[var(--color-accent)]">{formatCurrency(heroProduct.price)}</p>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                    heroProduct.stock > 0 ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20" : "bg-red-500/15 text-red-300 border border-red-500/20"
                  }`}>
                    {heroProduct.stock > 0 ? `${heroProduct.stock} in stock` : "Out of stock"}
                  </span>
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  <button onClick={() => addToCart(heroProduct)} disabled={heroProduct.stock === 0}
                    className="px-8 py-4 bg-[var(--color-accent)] text-white font-bold rounded-2xl hover:bg-[var(--color-primary-light)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[var(--color-accent)]/25">
                    Add to Cart
                  </button>
                  <button onClick={() => setSelectedProduct(heroProduct)}
                    className="px-8 py-4 border-2 border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all">
                    View Details
                  </button>
                </div>

                {/* Carousel dots */}
                {products.length > 1 && (
                  <div className="mt-14 flex items-center gap-2">
                    {products.slice(0, Math.min(products.length, 8)).map((_, i) => (
                      <button key={i} onClick={() => setHeroIdx(i)} aria-label={`Go to product ${i + 1}`}
                        className={`rounded-full transition-all duration-500 ${i === heroIdx ? "w-8 h-2 bg-[var(--color-accent)]" : "w-2 h-2 bg-white/20 hover:bg-white/40"}`} />
                    ))}
                    {products.length > 8 && <span className="text-[10px] text-white/30 ml-1">+{products.length - 8}</span>}
                  </div>
                )}
              </div>

              {/* Right: Product Image */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[420px] lg:h-[420px]">
                  <div className="absolute inset-12 bg-[var(--color-accent)]/10 rounded-full blur-3xl" />
                  <div className="absolute inset-0 border border-white/[0.06] rounded-full" />
                  {heroProduct.image ? (
                    <Image src={heroProduct.image} alt={heroProduct.name} fill priority
                      className="object-contain p-10 relative z-10 drop-shadow-2xl animate-float" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <svg className="w-20 h-20 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Trust Indicators ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-gray-500">
            {[
              { icon: "🏭", label: "Made in Philippines" },
              { icon: "✅", label: "ISO 9001 Certified" },
              { icon: "🌿", label: "Bio-Based Formula" },
              { icon: "🔬", label: "DOST Accredited" },
              { icon: "📦", label: "Nationwide Delivery" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                <span className="text-base">{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category Cards ── */}
      {!loading && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0a2e2e]">Browse by Category</h2>
            {filterCategory && (
              <button onClick={() => setFilterCategory("")}
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const config = CATEGORY_CONFIG[cat!] || CATEGORY_CONFIG.default;
              const count = products.filter((p) => p.category === cat).length;
              const isActive = filterCategory === cat;
              return (
                <button key={cat} onClick={() => setFilterCategory(isActive ? "" : cat!)}
                  className={`group relative rounded-2xl p-5 text-left overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                    isActive ? "ring-2 ring-[var(--color-accent)] ring-offset-2 shadow-lg" : "shadow-sm hover:shadow-md"
                  }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} transition-opacity ${isActive ? "opacity-100" : "opacity-85 group-hover:opacity-100"}`} />
                  <div className="relative z-10">
                    <span className="text-2xl">{config.icon}</span>
                    <h3 className="text-white font-bold mt-2.5 text-sm">{cat}</h3>
                    <p className="text-white/40 text-[11px] mt-0.5 font-medium">{count} product{count !== 1 ? "s" : ""}</p>
                  </div>
                  {isActive && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Product Catalog ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" id="catalog">
        {/* Toolbar */}
        <div className="sticky top-16 z-30 bg-[#fafcfb]/90 backdrop-blur-md py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-gray-100/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none sm:w-72">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] bg-white transition-all" />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] cursor-pointer">
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="name-asc">Name: A → Z</option>
                <option value="name-desc">Name: Z → A</option>
              </select>
              {/* View Toggle */}
              <div className="hidden sm:flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setViewMode("grid")} aria-label="Grid view"
                  className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-[var(--color-accent)] text-white" : "bg-white text-gray-400 hover:text-gray-600"}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </button>
                <button onClick={() => setViewMode("list")} aria-label="List view"
                  className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-[var(--color-accent)] text-white" : "bg-white text-gray-400 hover:text-gray-600"}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* Results count */}
          <p className="text-xs text-gray-400 mt-2">
            {loading ? "Loading..." : `${sortedProducts.length} product${sortedProducts.length !== 1 ? "s" : ""}`}
            {filterCategory && <span> in <strong className="text-gray-600">{filterCategory}</strong></span>}
            {debouncedSearch && <span> matching &ldquo;<strong className="text-gray-600">{debouncedSearch}</strong>&rdquo;</span>}
          </p>
        </div>

        {/* Product Grid / List */}
        <div className="mt-8">
          {loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse ${viewMode === "list" ? "flex h-36" : ""}`}>
                  <div className={viewMode === "grid" ? "h-56 bg-gray-50" : "w-36 bg-gray-50"} />
                  <div className="p-5 flex-1 space-y-3">
                    <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                    <div className="h-3 bg-gray-50 rounded-lg w-full" />
                    <div className="h-3 bg-gray-50 rounded-lg w-1/2" />
                    <div className="h-6 bg-gray-100 rounded-lg w-1/3 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="text-gray-600 font-bold text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter</p>
              {(search || filterCategory) && (
                <button onClick={() => { setSearch(""); setFilterCategory(""); }}
                  className="mt-4 px-5 py-2 text-sm font-semibold text-[var(--color-accent)] border border-[var(--color-accent)]/30 rounded-xl hover:bg-[var(--color-accent)]/5 transition-colors">
                  Clear all filters
                </button>
              )}
            </div>

          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} addedId={addedId} onQuickView={setSelectedProduct} />
                ))}
              </div>
              {visibleCount < sortedProducts.length && (
                <div ref={loadMoreRef} className="flex justify-center py-12">
                  <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading more...
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-3">
                {visibleProducts.map((product) => (
                  <ProductListItem key={product.id} product={product} onAdd={addToCart} addedId={addedId} onQuickView={setSelectedProduct} />
                ))}
              </div>
              {visibleCount < sortedProducts.length && (
                <div ref={loadMoreRef} className="flex justify-center py-12">
                  <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading more...
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Custom Formulation CTA ── */}
      <section className="bg-gradient-to-br from-[#0a2e2e] via-[#0d3d3d] to-[#1a5a4a] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[var(--color-accent)]/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/3 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-poppins)]">
            Need a Custom Formulation?
          </h2>
          <p className="mt-4 text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Our R&D team develops custom adhesive and sealant solutions for your unique industrial requirements. From concept to production in 4-8 weeks.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact"
              className="px-8 py-4 bg-[var(--color-accent)] text-white font-bold rounded-2xl hover:bg-[var(--color-primary-light)] transition-all hover:scale-[1.02] shadow-lg shadow-[var(--color-accent)]/20">
              Request Formulation
            </Link>
            <Link href="/messages"
              className="px-8 py-4 border-2 border-white/15 text-white font-bold rounded-2xl hover:bg-white/5 hover:border-white/30 transition-all">
              Chat With Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* ── Product Detail Modal ── */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} addedId={addedId} />
      )}

      {/* ── Cart Drawer ── */}
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD (Grid View)
   ═══════════════════════════════════════════════════════════════ */
function ProductCard({ product, onAdd, addedId, onQuickView }: {
  product: Product;
  onAdd: (p: Product) => void;
  addedId: string | null;
  onQuickView: (p: Product) => void;
}) {
  const isOut = product.stock === 0;
  const isAdded = addedId === product.id;
  const isLow = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-400">
      {/* Image */}
      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-[#f0f7f4] flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}>
        {product.image ? (
          <Image src={product.image} alt={product.name} width={280} height={280}
            className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500 ease-out" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-accent)]/5 flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--color-accent)]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.category && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/95 text-gray-700 shadow-sm backdrop-blur-sm border border-gray-100/50">
              {product.category}
            </span>
          )}
        </div>
        {isOut && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-500 text-white shadow-sm">
            Sold Out
          </span>
        )}
        {!isOut && isLow && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500 text-white shadow-sm">
            Only {product.stock} left
          </span>
        )}
        {/* Quick View overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 px-4 py-2 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-lg border border-gray-100">
            Quick View
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="text-[10px] text-gray-400 font-mono tracking-wide mb-1">{product.sku}</p>
        <h3 className="text-base font-bold text-[#0a2e2e] group-hover:text-[var(--color-accent)] transition-colors leading-snug line-clamp-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        <div className="flex items-end justify-between mt-4">
          <p className="text-xl font-bold text-[#0a2e2e]">{formatCurrency(product.price)}</p>
          {!isOut && <p className="text-[10px] text-gray-400">{product.stock} available</p>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onAdd(product); }} disabled={isOut}
          className={`w-full mt-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            isAdded ? "bg-emerald-500 text-white" :
            isOut ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
            "bg-[#0a2e2e] text-white hover:bg-[var(--color-accent)] hover:shadow-md"
          }`}>
          {isAdded ? "✓ Added" : isOut ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT LIST ITEM (List View)
   ═══════════════════════════════════════════════════════════════ */
function ProductListItem({ product, onAdd, addedId, onQuickView }: {
  product: Product;
  onAdd: (p: Product) => void;
  addedId: string | null;
  onQuickView: (p: Product) => void;
}) {
  const isOut = product.stock === 0;
  const isAdded = addedId === product.id;
  const isLow = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-100 transition-all duration-300 flex">
      {/* Image */}
      <div className="w-32 sm:w-40 shrink-0 bg-gradient-to-br from-gray-50 to-[#f0f7f4] flex items-center justify-center cursor-pointer relative"
        onClick={() => onQuickView(product)}>
        {product.image ? (
          <Image src={product.image} alt={product.name} width={160} height={160}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3" />
          </svg>
        )}
        {isOut && <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-red-500 text-white">Sold Out</span>}
        {!isOut && isLow && <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-white">{product.stock} left</span>}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {product.category && <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-600">{product.category}</span>}
            <span className="text-[10px] text-gray-400 font-mono">{product.sku}</span>
          </div>
          <h3 className="text-sm font-bold text-[#0a2e2e] mt-1.5 group-hover:text-[var(--color-accent)] transition-colors truncate">{product.name}</h3>
          {product.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.description}</p>}
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-[#0a2e2e]">{formatCurrency(product.price)}</p>
            {!isOut && <p className="text-[10px] text-gray-400">{product.stock} in stock</p>}
          </div>
          <button onClick={() => onAdd(product)} disabled={isOut}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              isAdded ? "bg-emerald-500 text-white" :
              isOut ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
              "bg-[#0a2e2e] text-white hover:bg-[var(--color-accent)] hover:shadow-md"
            }`}>
            {isAdded ? "✓ Added" : isOut ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT DETAIL MODAL
   ═══════════════════════════════════════════════════════════════ */
function ProductModal({ product, onClose, onAdd, addedId }: {
  product: Product;
  onClose: () => void;
  onAdd: (p: Product, qty?: number) => void;
  addedId: string | null;
}) {
  const [qty, setQty] = useState(1);
  const isOut = product.stock === 0;
  const isAdded = addedId === product.id;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-gray-100 transition-colors shadow-md border border-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image side */}
        <div className="md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-gray-50 to-[#f0f7f4] flex items-center justify-center p-8 shrink-0">
          {product.image ? (
            <Image src={product.image} alt={product.name} width={400} height={400}
              className="w-full h-full object-contain max-h-80" />
          ) : (
            <svg className="w-24 h-24 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3" />
            </svg>
          )}
        </div>

        {/* Detail side */}
        <div className="md:w-1/2 p-8 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {product.category && (
              <span className="px-3 py-1 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold">
                {product.category}
              </span>
            )}
            <span className="text-[10px] text-gray-400 font-mono">{product.sku}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2e2e] font-[family-name:var(--font-poppins)] leading-tight">
            {product.name}
          </h2>

          {product.description && (
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center gap-3 mt-6">
            <p className="text-3xl font-bold text-[#0a2e2e]">{formatCurrency(product.price)}</p>
          </div>

          <div className="mt-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isOut ? "bg-red-50 text-red-600" : product.stock <= 5 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOut ? "bg-red-500" : product.stock <= 5 ? "bg-amber-500" : "bg-emerald-500"}`} />
              {isOut ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} in stock`}
            </span>
          </div>

          {/* Quantity + Add to Cart */}
          {!isOut && (
            <div className="mt-8">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantity</label>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-medium">−</button>
                  <span className="w-10 h-10 flex items-center justify-center text-sm font-bold border-x border-gray-200">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-medium">+</button>
                </div>
                <span className="text-xs text-gray-400">max {product.stock}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => { onAdd(product, qty); setQty(1); }} disabled={isOut}
              className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                isAdded ? "bg-emerald-500 text-white" :
                isOut ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
                "bg-[#0a2e2e] text-white hover:bg-[var(--color-accent)] hover:shadow-lg"
              }`}>
              {isAdded ? "✓ Added to Cart" : isOut ? "Out of Stock" : `Add to Cart — ${formatCurrency(product.price * qty)}`}
            </button>
          </div>

          {/* Extra info */}
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
            {[
              { icon: "📦", text: "Free shipping on orders over ₱5,000" },
              { icon: "🔄", text: "Bulk discounts available for 50+ units" },
              { icon: "🏭", text: "Custom formulation available on request" },
            ].map((info) => (
              <div key={info.text} className="flex items-center gap-2.5 text-xs text-gray-500">
                <span>{info.icon}</span>
                <span>{info.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CART DRAWER
   ═══════════════════════════════════════════════════════════════ */
function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0a2e2e]">Shopping Cart</h2>
            <p className="text-xs text-gray-400 mt-0.5">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-semibold">Your cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Add products to get started</p>
              <button onClick={onClose} className="mt-4 text-sm font-semibold text-[var(--color-accent)] hover:underline">
                Continue Shopping
              </button>
            </div>
          ) : items.map((item) => (
            <div key={item.productId} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100/50">
              <div className="w-14 h-14 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={48} height={48} className="w-full h-full object-contain p-1" />
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0a2e2e] truncate">{item.name}</p>
                <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-0.5">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs font-bold">−</button>
                    <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs font-bold">+</button>
                  </div>
                  <p className="text-sm font-bold text-[#0a2e2e]">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
              <button onClick={() => removeItem(item.productId)}
                className="self-start p-1 text-gray-300 hover:text-red-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-4 bg-white">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                <span className="font-bold text-[#0a2e2e]">{formatCurrency(total)}</span>
              </div>
              <p className="text-[10px] text-gray-400">Shipping and taxes calculated at checkout</p>
            </div>
            <Link href="/checkout" onClick={onClose}
              className="block w-full py-3.5 text-center text-sm font-bold text-white bg-[#0a2e2e] hover:bg-[var(--color-accent)] rounded-xl transition-all shadow-md">
              Proceed to Checkout
            </Link>
            <button onClick={onClose}
              className="block w-full py-2.5 text-center text-xs font-semibold text-gray-500 hover:text-[var(--color-accent)] transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
