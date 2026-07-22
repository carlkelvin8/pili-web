"use client";

import { useState, useEffect } from "react";
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

function formatCurrency(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ProductsPage() {
  const { addItem, itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({ active: "true" });
    if (search) params.set("search", search);
    if (filterCategory) params.set("category", filterCategory);

    fetch(`/api/products?${params}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        setProducts(Array.isArray(d.products) ? d.products : []);
        setCategories(Array.isArray(d.categories) ? d.categories : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, filterCategory]);

  useEffect(() => {
    if (products.length < 2) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % products.length), 4000);
    return () => clearInterval(t);
  }, [products.length]);

  function addToCart(product: Product, qty = 1) {
    addItem({ productId: product.id, name: product.name, sku: product.sku, price: product.price, image: product.image || undefined }, qty);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  const heroProduct = products[heroIdx] || products[0];

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      {/* Nav */}
      <div className="sticky top-0 z-40 bg-[#0a2e2e]/95 backdrop-blur-md text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-[var(--color-accent)] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Home
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 hidden sm:inline">Pili AdheSeal Products</span>
            <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.046A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5" /></svg>
              {itemCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-accent)] text-white text-[9px] font-bold rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center">{itemCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Hero — rotating featured product */}
      {!loading && heroProduct && (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0a2e2e] via-[#0d3d3d] to-[#1a5a4a] text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--color-accent)] rounded-full blur-[120px]" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-[150px]" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                {heroProduct.category && <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[var(--color-accent)] text-xs font-semibold mb-4 backdrop-blur-sm">{heroProduct.category}</span>}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-[family-name:var(--font-poppins)]">{heroProduct.name}</h1>
                {heroProduct.description && <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-lg">{heroProduct.description}</p>}
                <div className="mt-8 flex items-center gap-4">
                  <p className="text-3xl font-bold text-[var(--color-accent)]">{formatCurrency(heroProduct.price)}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${heroProduct.stock > 0 ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                    {heroProduct.stock > 0 ? `${heroProduct.stock} in stock` : "Out of stock"}
                  </span>
                </div>
                <div className="mt-8 flex gap-3">
                  <button onClick={() => addToCart(heroProduct)} disabled={heroProduct.stock === 0}
                    className="px-6 py-3 bg-[var(--color-accent)] text-[#0a2e2e] font-semibold rounded-xl hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    Add to Cart
                  </button>
                  <button onClick={() => { addToCart(heroProduct); setCartOpen(true); }} disabled={heroProduct.stock === 0}
                    className="px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    Buy Now
                  </button>
                </div>
                {/* Dots */}
                {products.length > 1 && (
                  <div className="mt-10 flex gap-2">
                    {products.map((_, i) => (
                      <button key={i} onClick={() => setHeroIdx(i)}
                        className={`h-2 rounded-full transition-all ${i === heroIdx ? "w-8 bg-[var(--color-accent)]" : "w-2 bg-white/30 hover:bg-white/50"}`} />
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex justify-center">
                <div className="relative w-72 h-72 sm:w-96 sm:h-96">
                  <div className="absolute inset-0 bg-[var(--color-accent)]/20 rounded-full blur-3xl" />
                  {heroProduct.image ? (
                    <Image src={heroProduct.image} alt={heroProduct.name} fill className="object-contain relative z-10 drop-shadow-2xl animate-float" />
                  ) : (
                    <div className="w-full h-full rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-24 h-24 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0V6.75a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25v.75" /></svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#0a2e2e] font-[family-name:var(--font-poppins)]">All Products</h2>
            <p className="text-sm text-gray-500 mt-1">{products.length} product{products.length !== 1 ? "s" : ""} available</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] bg-white shadow-sm" />
            </div>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]">
              <option value="">All</option>
              {categories.map((c) => <option key={c} value={c!}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-100" />
                <div className="p-5 space-y-3"><div className="h-4 bg-gray-100 rounded w-3/4" /><div className="h-3 bg-gray-50 rounded w-full" /><div className="h-6 bg-gray-100 rounded w-1/3" /></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0V6.75" /></svg>
            <p className="text-gray-500 font-medium">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const isOut = product.stock === 0;
              const isAdded = addedId === product.id;
              const isLow = product.stock > 0 && product.stock <= 5;
              return (
                <div key={product.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#0a2e2e]/5 hover:-translate-y-1 transition-all duration-500">
                  {/* Image */}
                  <div className="relative h-56 bg-gradient-to-br from-[#f0f7f7] to-[#e8f4f0] flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => setSelectedProduct(product)}>
                    {product.image ? (
                      <Image src={product.image} alt={product.name} width={300} height={300}
                        className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700 ease-out" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary-light)]/10 flex items-center justify-center">
                        <svg className="w-10 h-10 text-[var(--color-primary-light)]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0V6.75" /></svg>
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {product.category && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-[#0a2e2e] shadow-sm backdrop-blur-sm">{product.category}</span>}
                    </div>
                    {isOut && <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white shadow-sm">Out of Stock</span>}
                    {!isOut && isLow && <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm">Low Stock</span>}
                    {/* Quick view overlay */}
                    <div className="absolute inset-0 bg-[#0a2e2e]/0 group-hover:bg-[#0a2e2e]/5 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-[#0a2e2e] shadow-lg">Quick View</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-[#0a2e2e] group-hover:text-[var(--color-accent)] transition-colors">{product.name}</h3>
                    {product.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>}
                    <div className="flex items-end justify-between mt-3">
                      <p className="text-xl font-bold text-[var(--color-accent)]">{formatCurrency(product.price)}</p>
                      {!isOut && <p className="text-[10px] text-gray-400">{product.stock} units</p>}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => addToCart(product)} disabled={isOut}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          isAdded ? "bg-green-500 text-white scale-95" : isOut ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#0a2e2e] text-white hover:bg-[var(--color-accent)] hover:text-[#0a2e2e]"
                        }`}>
                        {isAdded ? "✓ Added" : isOut ? "Unavailable" : "Add to Cart"}
                      </button>
                      <button onClick={() => { addToCart(product); setCartOpen(true); }} disabled={isOut}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-300 ${
                          isOut ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[#0a2e2e]"
                        }`}>
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="h-72 sm:h-80 bg-gradient-to-br from-[#f0f7f7] to-[#e8f4f0] flex items-center justify-center rounded-t-3xl overflow-hidden">
              {selectedProduct.image ? (
                <Image src={selectedProduct.image} alt={selectedProduct.name} width={400} height={400} className="w-full h-full object-contain p-8" />
              ) : (
                <svg className="w-24 h-24 text-[var(--color-primary-light)]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0V6.75" /></svg>
              )}
            </div>
            <div className="p-6 sm:p-8">
              {selectedProduct.category && <span className="inline-block px-3 py-0.5 rounded-full bg-[var(--color-primary-light)]/10 text-[var(--color-primary)] text-xs font-semibold mb-3">{selectedProduct.category}</span>}
              <h2 className="text-2xl font-bold text-[#0a2e2e] font-[family-name:var(--font-poppins)]">{selectedProduct.name}</h2>
              <p className="text-xs text-gray-400 font-mono mt-1">{selectedProduct.sku}</p>
              {selectedProduct.description && <p className="text-sm text-gray-500 mt-4 leading-relaxed">{selectedProduct.description}</p>}
              <div className="flex items-center gap-3 mt-6">
                <p className="text-3xl font-bold text-[var(--color-accent)]">{formatCurrency(selectedProduct.price)}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedProduct.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : "Out of stock"}
                </span>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} disabled={selectedProduct.stock === 0}
                  className="flex-1 py-3 bg-[#0a2e2e] text-white font-semibold rounded-xl hover:bg-[var(--color-accent)] hover:text-[#0a2e2e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Add to Cart
                </button>
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); setCartOpen(true); }} disabled={selectedProduct.stock === 0}
                  className="flex-1 py-3 border-2 border-[var(--color-accent)] text-[var(--color-accent)] font-semibold rounded-xl hover:bg-[var(--color-accent)] hover:text-[#0a2e2e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </div>
  );
}

function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0a2e2e]">Cart ({itemCount})</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16"><svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.046A1.125 1.125 0 0018.054 3H5.106" /></svg><p className="text-gray-400 text-sm">Empty cart</p></div>
          ) : items.map((item) => (
            <div key={item.productId} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {item.image ? <Image src={item.image} alt={item.name} width={48} height={48} className="w-full h-full object-contain p-1" /> : <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622" /></svg>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0a2e2e] truncate">{item.name}</p>
                <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs">−</button>
                    <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs">+</button>
                  </div>
                  <p className="text-sm font-bold text-[#0a2e2e]">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
              <button onClick={() => removeItem(item.productId)} className="self-start p-1 text-gray-300 hover:text-red-500"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-bold text-[#0a2e2e]">{formatCurrency(total)}</span></div>
            <Link href="/checkout" onClick={onClose} className="block w-full py-3 text-center text-sm font-semibold text-white bg-[#0d4d4d] hover:bg-[#1a8a6e] rounded-xl transition-colors">Proceed to Checkout</Link>
          </div>
        )}
      </div>
    </div>
  );
}
