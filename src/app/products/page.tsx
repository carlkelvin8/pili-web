"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";

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

type SortOption = "popular" | "newest" | "price-asc" | "price-desc" | "name-asc";

function formatCurrency(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef<HTMLDivElement>(null);

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
        setVisibleCount(12);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch, filterCategory]);

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

  // Sort
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-asc": sorted.sort((a, b) => a.price - b.price); break;
      case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
      case "name-asc": sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return sorted;
  }, [products, sortBy]);

  const visibleProducts = sortedProducts.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[var(--color-light)]">
      <Header />

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-sm text-[var(--color-primary)]/60">
          <Link href="/" className="hover:text-[var(--color-accent)] transition-colors">Home</Link>
          <span>/</span>
          {filterCategory ? (
            <>
              <button onClick={() => setFilterCategory("")} className="hover:text-[var(--color-accent)] transition-colors">Products</button>
              <span>/</span>
              <span className="text-[var(--color-dark)]">{filterCategory}</span>
            </>
          ) : (
            <span className="text-[var(--color-dark)]">Products</span>
          )}
        </nav>
      </div>

      {/* ── Page Title + Sort ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-dark)] font-[family-name:var(--font-poppins)] tracking-tight">
            {filterCategory || "Products"}
          </h1>
          <div className="flex items-center gap-3 text-sm text-[var(--color-primary)]/60">
            <span>{Math.min(visibleCount, sortedProducts.length)} from {sortedProducts.length} items</span>
            <span className="text-[var(--color-primary)]/30">·</span>
            <span>Sort by</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="font-semibold text-[var(--color-dark)] bg-transparent border-none focus:outline-none cursor-pointer">
              <option value="popular">Most popular</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Category */}
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3.5 bg-white border border-[var(--color-primary)]/15 text-sm text-[var(--color-dark)] focus:outline-none focus:border-[var(--color-accent)] cursor-pointer appearance-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%230d4d4d'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
            <option value="">CATEGORY</option>
            {categories.map((cat) => (
              <option key={cat} value={cat!}>{cat!.toUpperCase()}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative col-span-2">
            <input type="text" placeholder="SEARCH" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-[var(--color-primary)]/15 text-sm text-[var(--color-dark)] placeholder-[var(--color-primary)]/40 focus:outline-none focus:border-[var(--color-accent)] uppercase tracking-wide" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]/40 hover:text-[var(--color-dark)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Price range */}
          <select className="px-4 py-3.5 bg-white border border-[var(--color-primary)]/15 text-sm text-[var(--color-primary)]/40 focus:outline-none focus:border-[var(--color-accent)] cursor-pointer appearance-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%230d4d4d'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
            <option value="">PRICE RANGE</option>
            <option value="0-500">₱0 - ₱500</option>
            <option value="500-1000">₱500 - ₱1,000</option>
            <option value="1000-5000">₱1,000 - ₱5,000</option>
            <option value="5000+">₱5,000+</option>
          </select>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[var(--color-primary)]/5" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-[var(--color-primary)]/5 rounded w-3/4" />
                  <div className="h-3 bg-[var(--color-primary)]/5 rounded w-1/2" />
                  <div className="h-4 bg-[var(--color-primary)]/5 rounded w-1/4 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-lg text-[var(--color-primary)]/60">No products found</p>
            <p className="text-sm text-[var(--color-primary)]/40 mt-2">Try adjusting your search or filters</p>
            {(search || filterCategory) && (
              <button onClick={() => { setSearch(""); setFilterCategory(""); }}
                className="mt-6 px-6 py-2.5 text-sm font-medium text-[var(--color-dark)] border border-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-white transition-colors">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onQuickView={setSelectedProduct} />
              ))}
            </div>
            {visibleCount < sortedProducts.length && (
              <div ref={loadMoreRef} className="flex justify-center py-16">
                <div className="flex items-center gap-2 text-sm text-[var(--color-primary)]/40">
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
      </section>

      {/* ── Product Modal ── */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD
   ═══════════════════════════════════════════════════════════════ */
function ProductCard({ product, onQuickView }: {
  product: Product;
  onQuickView: (p: Product) => void;
}) {
  const isOut = product.stock === 0;
  const isLow = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group cursor-pointer" onClick={() => onQuickView(product)}>
      {/* Image */}
      <div className="relative aspect-[3/4] bg-white border border-[var(--color-primary)]/10 overflow-hidden">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill
            className="object-contain p-10 group-hover:scale-105 transition-transform duration-500 ease-out" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-[var(--color-primary)]/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3" />
            </svg>
          </div>
        )}



        {/* Badges (bottom-left) */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1.5">
          {isOut && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-red-600 text-white">
              Sold Out
            </span>
          )}
          {!isOut && isLow && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-white">
              Low Stock
            </span>
          )}
          {product.category && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-[var(--color-accent)] text-white">
              {product.category}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-[var(--color-dark)] leading-snug group-hover:text-[var(--color-accent)] transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-[var(--color-primary)]/50 mt-0.5 line-clamp-1">{product.description}</p>
        )}
        <p className="text-sm font-semibold text-[var(--color-dark)] mt-1.5">{formatCurrency(product.price)}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT MODAL
   ═══════════════════════════════════════════════════════════════ */
function ProductModal({ product, onClose }: {
  product: Product;
  onClose: () => void;
}) {
  const isOut = product.stock === 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[var(--color-dark)]/40 backdrop-blur-sm" />
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-[var(--color-light)] rounded-full transition-colors">
          <svg className="w-5 h-5 text-[var(--color-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="md:w-1/2 aspect-square md:aspect-auto bg-white border-r border-[var(--color-primary)]/10 flex items-center justify-center p-12 shrink-0">
          {product.image ? (
            <Image src={product.image} alt={product.name} width={400} height={400}
              className="w-full h-full object-contain max-h-96" />
          ) : (
            <svg className="w-24 h-24 text-[var(--color-primary)]/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3" />
            </svg>
          )}
        </div>

        {/* Details */}
        <div className="md:w-1/2 p-8 md:p-10 overflow-y-auto">
          {product.category && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">{product.category}</span>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-dark)] mt-2 font-[family-name:var(--font-poppins)] leading-tight">
            {product.name}
          </h2>
          <p className="text-xs text-[var(--color-primary)]/40 font-mono mt-1">{product.sku}</p>

          {product.description && (
            <p className="text-sm text-[var(--color-primary)]/60 mt-5 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-6">
            <p className="text-2xl font-bold text-[var(--color-dark)]">{formatCurrency(product.price)}</p>
            <span className={`inline-block mt-2 text-xs font-medium ${
              isOut ? "text-red-600" : product.stock <= 5 ? "text-amber-600" : "text-[var(--color-accent)]"
            }`}>
              {isOut ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} in stock`}
            </span>
          </div>

          {/* Extra info */}
          <div className="mt-8 pt-6 border-t border-[var(--color-primary)]/10 space-y-3 text-xs text-[var(--color-primary)]/50">
            <p>Free shipping on orders over ₱5,000</p>
            <p>Bulk discounts available for 50+ units</p>
            <p>Custom formulation on request</p>
          </div>
        </div>
      </div>
    </div>
  );
}


