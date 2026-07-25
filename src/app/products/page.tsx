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

const CATEGORY_CONFIG: Record<string, { gradient: string; tagline: string }> = {
  Adhesives: { gradient: "from-[#0a2e2e] to-[#0d4d4d]", tagline: "Engineered for Unbreakable Bonds" },
  Sealants: { gradient: "from-[#0c1a2e] to-[#162d4a]", tagline: "Weather-Proof Protection" },
  Glue: { gradient: "from-[#1a0a2e] to-[#2d1648]", tagline: "Powerful Hold, Naturally Better" },
  default: { gradient: "from-[#0a2e2e] to-[#1a5a4a]", tagline: "Industrial-Grade Solutions" },
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
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const heroIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        setVisibleCount(12);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch, filterCategory]);

  useEffect(() => {
    if (products.length < 2) return;
    heroIntervalRef.current = setInterval(() => setHeroIdx((i) => (i + 1) % products.length), 5000);
    return () => { if (heroIntervalRef.current) clearInterval(heroIntervalRef.current); };
  }, [products.length]);

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

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-asc": sorted.sort((a, b) => a.price - b.price); break;
      case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
      case "name-asc": sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: break;
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
    <div className="min-h-screen bg-white text-[#0a2e2e]">

      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-[#0a2e2e] transition-colors tracking-wide">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400">Shop</span>
          <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors group">
            <svg className="w-5 h-5 text-gray-500 group-hover:text-[#0a2e2e] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#0a2e2e] text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      {!loading && heroProduct && (
        <section className="relative bg-[#0a2e2e] overflow-hidden min-h-[85vh] flex items-center mt-14">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#3ecbac]/[0.04] rounded-full blur-[300px]" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[250px]" />
            <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          </div>

          <div className="max-w-[1400px] mx-auto px-5 sm:px-8 w-full relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="text-white">
                {heroProduct.category && (
                  <span className="inline-block text-[11px] tracking-[0.3em] uppercase text-white/30 font-medium mb-6">{heroProduct.category}</span>
                )}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
                  {heroProduct.name}
                </h1>
                {heroProduct.description && (
                  <p className="mt-8 text-lg text-white/40 leading-relaxed max-w-md">{heroProduct.description}</p>
                )}
                <div className="mt-10 flex items-baseline gap-5">
                  <span className="text-4xl font-bold text-[#3ecbac]">{formatCurrency(heroProduct.price)}</span>
                  <span className={`text-xs font-medium tracking-wide ${heroProduct.stock > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {heroProduct.stock > 0 ? "In Stock" : "Sold Out"}
                  </span>
                </div>
                <div className="mt-12 flex gap-4">
                  <button onClick={() => addToCart(heroProduct)} disabled={heroProduct.stock === 0}
                    className="px-10 py-4 bg-[#3ecbac] text-[#0a2e2e] text-[13px] font-bold tracking-wide rounded-none hover:bg-[#3ecbac]/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    Add to Cart
                  </button>
                  <button onClick={() => setSelectedProduct(heroProduct)}
                    className="px-10 py-4 border border-white/15 text-white text-[13px] font-medium tracking-wide rounded-none hover:bg-white/5 transition-all">
                    Details
                  </button>
                </div>
                {products.length > 1 && (
                  <div className="mt-20 flex gap-2">
                    {products.slice(0, Math.min(products.length, 10)).map((_, i) => (
                      <button key={i} onClick={() => setHeroIdx(i)}
                        className={`h-[2px] transition-all duration-700 ${i === heroIdx ? "w-10 bg-[#3ecbac]" : "w-4 bg-white/15 hover:bg-white/30"}`} />
                    ))}
                  </div>
                )}
              </div>

              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-80 h-80 sm:w-[450px] sm:h-[450px]">
                  <div className="absolute inset-16 bg-[#3ecbac]/[0.06] rounded-full blur-[80px]" />
                  <div className="absolute inset-0 border border-white/[0.04]" />
                  {heroProduct.image ? (
                    <Image src={heroProduct.image} alt={heroProduct.name} fill priority
                      className="object-contain p-12 relative z-10 drop-shadow-2xl" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-24 h-24 text-white/[0.06]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
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

      {/* ── Trust Bar ── */}
      <div className="border-b border-black/5">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-gray-400">
            {[
              { icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>, label: "Made in Philippines" },
              { icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: "ISO 9001 Certified" },
              { icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>, label: "Bio-Based Formula" },
              { icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>, label: "DOST Accredited" },
              { icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-5.98-4.092-11-9-11.5M4.875 18.75h-1.5" /></svg>, label: "Nationwide Delivery" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2.5 text-[11px] font-medium tracking-wide uppercase">
                <span className="text-[#0a2e2e]">{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Categories ── */}
      {!loading && categories.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-16 pb-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-[11px] tracking-[0.3em] uppercase text-gray-400 font-medium">Categories</h2>
              <p className="text-2xl sm:text-3xl font-bold text-[#0a2e2e] mt-2 tracking-tight">
                {filterCategory || "All Products"}
              </p>
            </div>
            {filterCategory && (
              <button onClick={() => setFilterCategory("")}
                className="text-[11px] tracking-wide uppercase font-medium text-gray-400 hover:text-[#0a2e2e] transition-colors flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-black/[0.04]">
            {categories.map((cat) => {
              const config = CATEGORY_CONFIG[cat!] || CATEGORY_CONFIG.default;
              const count = products.filter((p) => p.category === cat).length;
              const isActive = filterCategory === cat;
              return (
                <button key={cat} onClick={() => setFilterCategory(isActive ? "" : cat!)}
                  className={`group relative p-6 sm:p-8 text-left overflow-hidden transition-all duration-300 bg-white ${
                    isActive ? "ring-2 ring-[#0a2e2e] ring-offset-0 z-10" : ""
                  }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-[0.03]"}`} />
                  <div className="relative z-10">
                    <h3 className={`text-sm font-bold transition-colors ${isActive ? "text-[#0a2e2e]" : "text-gray-900 group-hover:text-[#0a2e2e]"}`}>
                      {cat}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-1">{count} product{count !== 1 ? "s" : ""}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Catalog ── */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 py-12">
        {/* Toolbar */}
        <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-xl py-4 -mx-5 px-5 sm:-mx-8 sm:px-8 border-b border-black/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-black/8 rounded-none text-[13px] focus:outline-none focus:border-[#0a2e2e] bg-transparent transition-colors" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2.5 border border-black/8 rounded-none text-[11px] tracking-wide uppercase font-medium bg-transparent focus:outline-none focus:border-[#0a2e2e] cursor-pointer appearance-none pr-8">
                <option value="newest">Newest</option>
                <option value="price-asc">Price Low</option>
                <option value="price-desc">Price High</option>
                <option value="name-asc">A-Z</option>
                <option value="name-desc">Z-A</option>
              </select>
              <span className="text-[11px] text-gray-400 tracking-wide hidden sm:inline">
                {loading ? "..." : `${sortedProducts.length} product${sortedProducts.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-black/[0.03]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white animate-pulse">
                  <div className="aspect-square bg-gray-50" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 bg-gray-100 w-1/3" />
                    <div className="h-4 bg-gray-100 w-3/4" />
                    <div className="h-3 bg-gray-100 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-32">
              <svg className="w-12 h-12 text-gray-200 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <p className="text-lg font-bold text-[#0a2e2e]">No products found</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter</p>
              {(search || filterCategory) && (
                <button onClick={() => { setSearch(""); setFilterCategory(""); }}
                  className="mt-6 px-8 py-3 text-[11px] tracking-wide uppercase font-medium text-[#0a2e2e] border border-black/10 hover:bg-black/[0.02] transition-colors">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-black/[0.03]">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} addedId={addedId} onQuickView={setSelectedProduct} />
                ))}
              </div>
              {visibleCount < sortedProducts.length && (
                <div ref={loadMoreRef} className="flex justify-center py-16">
                  <div className="flex items-center gap-2.5 text-gray-400 text-[11px] tracking-wide uppercase font-medium">
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Custom Formulation CTA ── */}
      <section className="bg-[#0a2e2e] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3ecbac]/[0.03] rounded-full blur-[250px]" />
        </div>
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-24 sm:py-32 text-center relative z-10">
          <span className="text-[11px] tracking-[0.3em] uppercase text-white/25 font-medium">Custom Solutions</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 tracking-tight">
            Need a Custom Formulation?
          </h2>
          <p className="mt-6 text-white/35 text-base max-w-xl mx-auto leading-relaxed">
            Our R&amp;D team develops custom adhesive and sealant solutions for your unique industrial requirements.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact"
              className="px-10 py-4 bg-[#3ecbac] text-[#0a2e2e] text-[13px] font-bold tracking-wide rounded-none hover:bg-[#3ecbac]/90 transition-all">
              Request Formulation
            </Link>
            <Link href="/messages"
              className="px-10 py-4 border border-white/15 text-white text-[13px] font-medium tracking-wide rounded-none hover:bg-white/5 transition-all">
              Chat With Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── Modal ── */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} addedId={addedId} />
      )}

      {/* ── Cart Drawer ── */}
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD
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
    <div className="group bg-white">
      <div className="relative aspect-square bg-[#f8faf9] flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}>
        {product.image ? (
          <Image src={product.image} alt={product.name} width={400} height={400}
            className="w-full h-full object-contain p-10 group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
        ) : (
          <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3" />
          </svg>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5">
          {product.category && (
            <span className="px-2.5 py-1 text-[9px] tracking-[0.15em] uppercase font-bold bg-white text-gray-500 border border-black/5">
              {product.category}
            </span>
          )}
        </div>
        {isOut && (
          <span className="absolute top-4 right-4 px-2.5 py-1 text-[9px] tracking-[0.15em] uppercase font-bold bg-[#0a2e2e] text-white">
            Sold Out
          </span>
        )}
        {!isOut && isLow && (
          <span className="absolute top-4 right-4 px-2.5 py-1 text-[9px] tracking-[0.15em] uppercase font-bold bg-amber-500 text-white">
            {product.stock} left
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#0a2e2e]/0 group-hover:bg-[#0a2e2e]/[0.02] transition-colors duration-500 flex items-end justify-center pb-8">
          <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400 px-6 py-2.5 bg-[#0a2e2e] text-white text-[10px] tracking-[0.2em] uppercase font-medium">
            Quick View
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <p className="text-[10px] text-gray-300 font-mono tracking-wider mb-2">{product.sku}</p>
        <h3 className="text-[15px] font-bold text-[#0a2e2e] group-hover:text-[#3ecbac] transition-colors leading-snug line-clamp-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-[12px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        <div className="flex items-end justify-between mt-5">
          <p className="text-lg font-bold text-[#0a2e2e]">{formatCurrency(product.price)}</p>
          {!isOut && <p className="text-[10px] text-gray-400 tracking-wide">{product.stock} available</p>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onAdd(product); }} disabled={isOut}
          className={`w-full mt-5 py-3.5 text-[11px] tracking-[0.15em] uppercase font-bold transition-all duration-300 ${
            isAdded ? "bg-[#3ecbac] text-[#0a2e2e]" :
            isOut ? "bg-gray-50 text-gray-300 cursor-not-allowed border border-black/5" :
            "bg-[#0a2e2e] text-white hover:bg-[#3ecbac] hover:text-[#0a2e2e]"
          }`}>
          {isAdded ? "Added" : isOut ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT MODAL
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#0a2e2e]/60 backdrop-blur-sm" />
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="md:w-1/2 h-72 md:h-auto bg-[#f8faf9] flex items-center justify-center p-8 shrink-0">
          {product.image ? (
            <Image src={product.image} alt={product.name} width={500} height={500}
              className="w-full h-full object-contain max-h-96" />
          ) : (
            <svg className="w-20 h-20 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3" />
            </svg>
          )}
        </div>

        {/* Detail */}
        <div className="md:w-1/2 p-8 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            {product.category && (
              <span className="px-2.5 py-1 text-[9px] tracking-[0.15em] uppercase font-bold bg-[#0a2e2e]/5 text-[#0a2e2e]">
                {product.category}
              </span>
            )}
            <span className="text-[10px] text-gray-300 font-mono">{product.sku}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2e2e] leading-tight">
            {product.name}
          </h2>

          {product.description && (
            <p className="text-sm text-gray-400 mt-4 leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center gap-4 mt-8">
            <p className="text-3xl font-bold text-[#0a2e2e]">{formatCurrency(product.price)}</p>
            <span className={`text-[10px] tracking-wide uppercase font-medium ${isOut ? "text-red-500" : product.stock <= 5 ? "text-amber-600" : "text-emerald-600"}`}>
              {isOut ? "Out of stock" : product.stock <= 5 ? `${product.stock} left` : "In stock"}
            </span>
          </div>

          {!isOut && (
            <div className="mt-8">
              <label className="text-[10px] tracking-[0.2em] uppercase font-medium text-gray-400">Quantity</label>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border border-black/10">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#0a2e2e] transition-colors">-</button>
                  <span className="w-10 h-10 flex items-center justify-center text-[13px] font-bold border-x border-black/10">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#0a2e2e] transition-colors">+</button>
                </div>
                <span className="text-[11px] text-gray-400">Max {product.stock}</span>
              </div>
            </div>
          )}

          <button onClick={() => { onAdd(product, qty); setQty(1); }} disabled={isOut}
            className={`w-full mt-8 py-4 text-[11px] tracking-[0.15em] uppercase font-bold transition-all duration-300 ${
              isAdded ? "bg-[#3ecbac] text-[#0a2e2e]" :
              isOut ? "bg-gray-50 text-gray-300 cursor-not-allowed" :
              "bg-[#0a2e2e] text-white hover:bg-[#3ecbac] hover:text-[#0a2e2e]"
            }`}>
            {isAdded ? "Added to Cart" : isOut ? "Sold Out" : `Add to Cart — ${formatCurrency(product.price * qty)}`}
          </button>

          <div className="mt-8 pt-6 border-t border-black/5 space-y-3">
            {[
              { icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-5.98-4.092-11-9-11.5M4.875 18.75h-1.5" /></svg>, text: "Free shipping on orders over ₱5,000" },
              { icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>, text: "Bulk discounts available for 50+ units" },
              { icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>, text: "Custom formulation available on request" },
            ].map((info) => (
              <div key={info.text} className="flex items-center gap-2.5 text-[12px] text-gray-400">
                <span className="text-gray-300">{info.icon}</span>
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
      <div className="absolute inset-0 bg-[#0a2e2e]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0a2e2e]">Cart</h2>
            <p className="text-[11px] text-gray-400 mt-0.5 tracking-wide">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-24">
              <svg className="w-12 h-12 text-gray-150 mx-auto mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className="text-[13px] font-bold text-[#0a2e2e]">Cart is empty</p>
              <p className="text-[11px] text-gray-400 mt-1">Add products to get started</p>
              <button onClick={onClose} className="mt-6 px-6 py-2.5 text-[11px] tracking-wide uppercase font-medium text-[#0a2e2e] border border-black/10 hover:bg-black/[0.02] transition-colors">
                Continue Shopping
              </button>
            </div>
          ) : items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4 bg-[#f8faf9] border border-black/[0.03]">
              <div className="w-16 h-16 bg-white border border-black/5 flex items-center justify-center shrink-0 overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={56} height={56} className="w-full h-full object-contain p-1.5" />
                ) : (
                  <svg className="w-5 h-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#0a2e2e] truncate">{item.name}</p>
                <p className="text-[10px] text-gray-300 font-mono mt-0.5">{item.sku}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-0 border border-black/10">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#0a2e2e] text-xs font-bold">-</button>
                    <span className="text-[12px] font-bold w-6 text-center border-x border-black/10">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#0a2e2e] text-xs font-bold">+</button>
                  </div>
                  <p className="text-[13px] font-bold text-[#0a2e2e]">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
              <button onClick={() => removeItem(item.productId)}
                className="self-start p-1 text-gray-300 hover:text-red-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-black/5 space-y-5 bg-white">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[12px] text-gray-400 tracking-wide">Subtotal ({itemCount} items)</span>
                <span className="text-[14px] font-bold text-[#0a2e2e]">{formatCurrency(total)}</span>
              </div>
              <p className="text-[10px] text-gray-300">Shipping calculated at checkout</p>
            </div>
            <Link href="/checkout" onClick={onClose}
              className="block w-full py-4 text-center text-[11px] tracking-[0.15em] uppercase font-bold text-white bg-[#0a2e2e] hover:bg-[#3ecbac] hover:text-[#0a2e2e] transition-all">
              Checkout
            </Link>
            <button onClick={onClose}
              className="block w-full py-2 text-center text-[11px] tracking-wide uppercase font-medium text-gray-400 hover:text-[#0a2e2e] transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
