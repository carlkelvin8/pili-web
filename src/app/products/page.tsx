"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "@/lib/cart-context";

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  image?: string;
}

function formatCurrency(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const PRODUCT_IMAGES: Record<string, string> = {
  "Pili Adhesive": "/products/pili-adhesive.svg",
  "Pili Glue": "/products/pili-glue.svg",
  "Pili Glue Stick": "/products/pili-glue.svg",
  "Pili Seal": "/products/pili-seal.svg",
  "Pili Hybrid Sealant": "/products/pili-hybrid.svg",
};

export default function ProductsPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ active: "true" });
    if (search) params.set("search", search);
    if (filterCategory) params.set("category", filterCategory);

    fetch(`/api/products?${params}`, { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data.products) ? data.products : []);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      })
      .catch(() => { /* silent */ })
      .finally(() => setLoading(false));
  }, [search, filterCategory]);

  function handleAddToCart(product: Product) {
    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      image: PRODUCT_IMAGES[product.name],
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  function handleBuyNow(product: Product) {
    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      image: PRODUCT_IMAGES[product.name],
    });
    setCartOpen(true);
  }

  return (
    <div className="min-h-screen bg-[var(--color-light)]">
      {/* Top bar */}
      <div className="bg-[#0a2e2e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-[var(--color-accent)] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </Link>
          <button onClick={() => setCartOpen(!cartOpen)} className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.046A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] font-[family-name:var(--font-poppins)]">Our Products</h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">Browse our full catalog of bio-based adhesives, sealants, and industrial bonding solutions.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] bg-white" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c!}>{c}</option>)}
          </select>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                <div className="h-48 bg-gray-100 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0V6.75a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25v.75m16.5 0v7.5a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25v-7.5" />
            </svg>
            <p className="text-gray-500 font-medium">No products available</p>
            <p className="text-gray-400 text-sm mt-1">Check back later for new products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const img = PRODUCT_IMAGES[product.name];
              const isOut = product.stock === 0;
              const isAdded = addedId === product.id;
              return (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                  {/* Image */}
                  <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 overflow-hidden">
                    {img ? (
                      <Image src={img} alt={product.name} width={280} height={280}
                        className="max-h-48 w-auto object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-[var(--color-primary-light)]/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-[var(--color-primary-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0V6.75a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25v.75m16.5 0v7.5" />
                        </svg>
                      </div>
                    )}
                    {product.category && (
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-gray-600 backdrop-blur-sm">
                        {product.category}
                      </span>
                    )}
                    {isOut && (
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">Out of Stock</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[var(--color-primary)]">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xl font-bold text-[var(--color-accent)]">{formatCurrency(product.price)}</p>
                      {!isOut && (
                        <p className="text-xs text-gray-400">{product.stock} in stock</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => handleAddToCart(product)} disabled={isOut}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isAdded
                            ? "bg-green-500 text-white"
                            : isOut
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-[#0a2e2e] text-white hover:bg-[#1a8a6e]"
                        }`}>
                        {isAdded ? "Added!" : isOut ? "Out of Stock" : "Add to Cart"}
                      </button>
                      <button onClick={() => handleBuyNow(product)} disabled={isOut}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                          isOut
                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                            : "border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white"
                        }`}>
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </div>
  );
}

function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0a2e2e]">Cart ({itemCount})</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.046A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5" />
              </svg>
              <p className="text-gray-500 text-sm">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-14 h-14 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={48} height={48} className="w-10 h-10 object-contain" />
                  ) : (
                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0V6.75" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0a2e2e] truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs">−</button>
                      <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs">+</button>
                    </div>
                    <p className="text-sm font-bold text-[#0a2e2e]">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
                <button onClick={() => removeItem(item.productId)} className="self-start p-1 text-gray-300 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-[#0a2e2e]">{formatCurrency(total)}</span>
            </div>
            <Link href="/checkout" onClick={onClose}
              className="block w-full py-3 text-center text-sm font-medium text-white bg-[#0d4d4d] hover:bg-[#1a8a6e] rounded-lg transition-colors">
              Proceed to Checkout
            </Link>
            <p className="text-[10px] text-gray-400 text-center">Shipping calculated at checkout</p>
          </div>
        )}
      </div>
    </div>
  );
}
