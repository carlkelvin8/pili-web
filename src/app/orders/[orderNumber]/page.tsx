"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  orderNumber: string;
  status: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string | null;
  shippingProvince: string | null;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  trackingNumber: string | null;
  courier: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  PENDING: { label: "Order Placed", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: "📋" },
  CONFIRMED: { label: "Order Confirmed", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: "✅" },
  SHIPPED: { label: "Shipped", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", icon: "📦" },
  IN_TRANSIT: { label: "In Transit", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", icon: "🚚" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: "🛵" },
  DELIVERED: { label: "Delivered", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: "📬" },
  COMPLETED: { label: "Completed", color: "text-green-700", bg: "bg-green-50", border: "border-green-200", icon: "🎉" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: "❌" },
  RETURNED: { label: "Returned", color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200", icon: "↩️" },
};

const COURIERS: Record<string, string> = {
  LBC: "LBC Express",
  JT_EXPRESS: "J&T Express",
  GOGOXPRESS: "GoGoXpress",
  LALAMOVE: "Lalamove",
  FLASH_EXPRESS: "Flash Express",
};

const TRACKING_FLOW = ["PENDING", "CONFIRMED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];

const TRACKING_LABELS: Record<string, string> = {
  PENDING: "Placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};

function formatCurrency(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const PRODUCT_IMAGES: Record<string, string> = {
  "Pili Adhesive": "/products/pili-adhesive.svg",
  "Pili Glue": "/products/pili-glue.svg",
  "Pili Glue Stick": "/products/pili-glue.svg",
  "Pili Seal": "/products/pili-seal.svg",
  "Pili Hybrid Sealant": "/products/pili-hybrid.svg",
};

export default function OrderTrackingPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const [orderNumberInput, setOrderNumberInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const directLookup = useCallback(async (orderNum: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNum)}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        setOrderNumberInput(orderNum);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    params.then((p) => {
      const num = p.orderNumber;
      if (num) {
        setOrderNumberInput(num);
        directLookup(num);
      }
    });
  }, [params, directLookup]);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const urlParams = new URLSearchParams();
      const num = orderNumberInput.trim().toUpperCase();
      if (!num) { setError("Please enter an order number"); setLoading(false); return; }
      urlParams.set("orderNumber", num);
      if (emailInput.trim()) urlParams.set("email", emailInput.trim());

      const res = await fetch(`/api/orders/track?${urlParams}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Order not found");
      }
      const data = await res.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  function resetSearch() {
    setOrder(null);
    setSearched(false);
    setError("");
    setOrderNumberInput("");
    setEmailInput("");
  }

  const statusConf = order ? STATUS_CONFIG[order.status] : null;
  const currentIdx = order ? TRACKING_FLOW.indexOf(order.status) : -1;
  const isCancelled = order?.status === "CANCELLED" || order?.status === "RETURNED";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0a2e2e] to-[#0d4d4d] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Home
          </Link>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--color-primary-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <h1 className="text-sm font-bold">Order Tracking</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lookup Form */}
        {!order && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0d4d4d] to-[#1a8a6e] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#0d4d4d]/20">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#0a2e2e]">Track Your Order</h2>
              <p className="text-gray-500 mt-2">Enter your order number to see real-time updates on your delivery.</p>
            </div>

            <form onSubmit={handleLookup} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5">
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Order Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={orderNumberInput}
                    onChange={(e) => setOrderNumberInput(e.target.value)}
                    required
                    placeholder="e.g. PAD-250722-00001"
                    className="w-full pl-11 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none font-mono tracking-wide"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="For verification"
                    className="w-full pl-11 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0d4d4d] to-[#1a8a6e] hover:from-[#0a2e2e] hover:to-[#0d4d4d] rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#0d4d4d]/20 hover:shadow-xl hover:shadow-[#0d4d4d]/30 hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Searching...
                  </span>
                ) : "Track Order"}
              </button>
            </form>
          </div>
        )}

        {/* Order Result */}
        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Order Number</p>
                  <h2 className="text-2xl font-bold text-[#0a2e2e] font-mono">{order.orderNumber}</h2>
                  <p className="text-sm text-gray-500 mt-1">Placed on {formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {statusConf && (
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusConf.bg} ${statusConf.color} ${statusConf.border} border`}>
                      <span className="text-lg">{statusConf.icon}</span>
                      {statusConf.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tracking Progress */}
            {!isCancelled && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">Shipping Progress</h3>

                {/* Desktop Progress Bar */}
                <div className="hidden sm:block">
                  <div className="relative flex items-center justify-between">
                    {/* Background line */}
                    <div className="absolute top-4 left-0 right-0 h-1 bg-gray-100 rounded-full" />
                    {/* Active line */}
                    <div
                      className="absolute top-4 left-0 h-1 bg-gradient-to-r from-[#0d4d4d] to-[#1a8a6e] rounded-full transition-all duration-700"
                      style={{ width: `${currentIdx >= 0 ? (currentIdx / (TRACKING_FLOW.length - 1)) * 100 : 0}%` }}
                    />

                    {TRACKING_FLOW.map((step, idx) => {
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={step} className="relative flex flex-col items-center z-10">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            isComplete
                              ? "bg-gradient-to-br from-[#0d4d4d] to-[#1a8a6e] text-white shadow-lg shadow-[#0d4d4d]/20"
                              : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                          } ${isCurrent ? "ring-4 ring-[#0d4d4d]/15 scale-110" : ""}`}>
                            {isComplete ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <p className={`text-[11px] mt-2 text-center font-medium ${isComplete ? "text-[#0a2e2e]" : "text-gray-400"}`}>
                            {TRACKING_LABELS[step]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Progress */}
                <div className="sm:hidden space-y-3">
                  {TRACKING_FLOW.map((step, idx) => {
                    const isComplete = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isComplete
                            ? "bg-gradient-to-br from-[#0d4d4d] to-[#1a8a6e] text-white"
                            : "bg-gray-100 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-[#0d4d4d]/15" : ""}`}>
                          {isComplete ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isComplete ? "text-[#0a2e2e]" : "text-gray-400"}`}>
                            {TRACKING_LABELS[step]}
                          </p>
                        </div>
                        {idx < TRACKING_FLOW.length - 1 && isComplete && (
                          <div className="w-0.5 h-4 bg-[#0d4d4d]/20 ml-4" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Courier & Tracking */}
            {(order.trackingNumber || order.courier) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Shipment Details</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {order.courier && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0a2e2e] text-white rounded-xl">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                      <span className="text-sm font-semibold">{COURIERS[order.courier] || order.courier}</span>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Tracking Number</p>
                      <p className="font-mono text-sm font-bold text-[#0a2e2e] tracking-wide">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>
                {order.shippedAt && (
                  <p className="text-xs text-gray-400 mt-3">
                    Shipped on {formatDateTime(order.shippedAt)}
                    {order.deliveredAt && ` · Delivered on ${formatDateTime(order.deliveredAt)}`}
                  </p>
                )}
              </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Order Items</h3>
              <div className="divide-y divide-gray-100">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      {PRODUCT_IMAGES[item.name] ? (
                        <Image src={PRODUCT_IMAGES[item.name]} alt={item.name} width={40} height={40} className="w-10 h-10 object-contain" />
                      ) : (
                        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0V6.75" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0a2e2e]">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku} · Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0a2e2e]">{formatCurrency(item.total)}</p>
                      <p className="text-[10px] text-gray-400">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-[#0a2e2e]">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping Fee</span>
                  <span className="text-[#0a2e2e]">{order.shippingFee > 0 ? formatCurrency(order.shippingFee) : "—"}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3">
                  <span className="text-[#0a2e2e]">Total Amount</span>
                  <span className="text-[var(--color-accent)]">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Shipping Address</h3>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0a2e2e]">{order.shippingName}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{order.shippingAddress}</p>
                  {(order.shippingCity || order.shippingProvince) && (
                    <p className="text-sm text-gray-500">
                      {order.shippingCity}{order.shippingProvince ? `, ${order.shippingProvince}` : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Cancellation Reason */}
            {order.cancelReason && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-red-700">Cancellation Reason</h3>
                    <p className="text-sm text-red-600 mt-1">{order.cancelReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                onClick={resetSearch}
                className="flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-[#0d4d4d] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Track Another Order
              </button>
              <Link
                href="/products"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0d4d4d] to-[#1a8a6e] hover:from-[#0a2e2e] hover:to-[#0d4d4d] rounded-xl transition-all duration-300 shadow-md shadow-[#0d4d4d]/15 hover:shadow-lg hover:-translate-y-0.5"
              >
                Continue Shopping
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
