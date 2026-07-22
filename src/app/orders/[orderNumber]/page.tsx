"use client";

import { useState } from "react";
import Link from "next/link";

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  PENDING: { label: "Order Placed", color: "text-yellow-700", bg: "bg-yellow-100", icon: "📋" },
  CONFIRMED: { label: "Order Confirmed", color: "text-blue-700", bg: "bg-blue-100", icon: "✅" },
  SHIPPED: { label: "Shipped", color: "text-indigo-700", bg: "bg-indigo-100", icon: "📦" },
  IN_TRANSIT: { label: "In Transit", color: "text-purple-700", bg: "bg-purple-100", icon: "🚚" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-orange-700", bg: "bg-orange-100", icon: "🛵" },
  DELIVERED: { label: "Delivered", color: "text-green-700", bg: "bg-green-100", icon: "📬" },
  COMPLETED: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-100", icon: "🎉" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-100", icon: "❌" },
  RETURNED: { label: "Returned", color: "text-gray-700", bg: "bg-gray-100", icon: "↩️" },
};

const COURIERS: Record<string, string> = {
  LBC: "LBC Express",
  JT_EXPRESS: "J&T Express",
  GOGOXPRESS: "GoGoXpress",
  LALAMOVE: "Lalamove",
  FLASH_EXPRESS: "Flash Express",
};

const TRACKING_FLOW = ["PENDING", "CONFIRMED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];

function formatCurrency(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function OrderTrackingPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const [orderNumberInput, setOrderNumberInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const params = new URLSearchParams();
      const num = orderNumberInput.trim().toUpperCase() || (await params).get("orderNumber") || "";
      if (!num) { setError("Enter an order number"); setLoading(false); return; }
      params.set("orderNumber", num);
      if (emailInput.trim()) params.set("email", emailInput.trim());

      const res = await fetch(`/api/orders/track?${params}`);
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

  // Direct lookup via URL
  async function directLookup(orderNum: string) {
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
  }

  // Check if params has orderNumber on mount
  const [resolvedParams, setResolvedParams] = useState<string | null>(null);
  useState(() => {
    params.then((p) => {
      const num = p.orderNumber;
      if (num) {
        setResolvedParams(num);
        setOrderNumberInput(num);
        directLookup(num);
      }
    });
  });

  return (
    <div className="min-h-screen bg-[var(--color-light)]">
      <div className="bg-[#0a2e2e] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-[var(--color-accent)] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Home
          </Link>
          <h1 className="text-sm font-bold">Track Order</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Lookup Form */}
        {!order && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <svg className="w-14 h-14 text-[var(--color-primary-light)] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <h2 className="text-2xl font-bold text-[#0a2e2e]">Track Your Order</h2>
              <p className="text-sm text-gray-500 mt-2">Enter your order number to see the latest status.</p>
            </div>

            <form onSubmit={handleLookup} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Number *</label>
                <input type="text" value={orderNumberInput} onChange={(e) => setOrderNumberInput(e.target.value)} required
                  placeholder="PAD-250722-00001"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="For verification"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 text-sm font-medium text-white bg-[#0d4d4d] hover:bg-[#1a8a6e] rounded-lg transition-colors disabled:opacity-50">
                {loading ? "Looking up..." : "Track Order"}
              </button>
            </form>
          </div>
        )}

        {/* Order Result */}
        {order && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#0a2e2e]">Order {order.orderNumber}</h2>
              <p className="text-sm text-gray-500 mt-1">Placed {formatDate(order.createdAt)}</p>
            </div>

            {/* Status Badge */}
            <div className="text-center">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${STATUS_CONFIG[order.status]?.bg} ${STATUS_CONFIG[order.status]?.color}`}>
                <span>{STATUS_CONFIG[order.status]?.icon}</span>
                {STATUS_CONFIG[order.status]?.label}
              </span>
            </div>

            {/* Tracking Progress */}
            {order.status !== "CANCELLED" && order.status !== "RETURNED" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Tracking Progress</h3>
                <div className="flex items-center justify-between">
                  {TRACKING_FLOW.map((step, idx) => {
                    const currentIdx = TRACKING_FLOW.indexOf(order.status);
                    const isComplete = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={step} className="flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isComplete ? "bg-[#0d4d4d] text-white" : "bg-gray-100 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-[#0d4d4d]/20" : ""}`}>
                          {isComplete ? "✓" : idx + 1}
                        </div>
                        <p className={`text-[10px] mt-1.5 text-center leading-tight ${isComplete ? "text-[#0a2e2e] font-medium" : "text-gray-400"}`}>
                          {STATUS_CONFIG[step]?.label}
                        </p>
                        {idx < TRACKING_FLOW.length - 1 && (
                          <div className={`absolute h-0.5 w-full ${idx < currentIdx ? "bg-[#0d4d4d]" : "bg-gray-200"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Courier & Tracking */}
            {(order.trackingNumber || order.courier) && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Shipment Details</h3>
                <div className="flex items-center gap-4">
                  {order.courier && (
                    <span className="px-3 py-1.5 bg-[#0a2e2e] text-white rounded-lg text-sm font-medium">{COURIERS[order.courier] || order.courier}</span>
                  )}
                  {order.trackingNumber && (
                    <div>
                      <p className="text-[10px] text-gray-400">Tracking Number</p>
                      <p className="font-mono text-sm font-semibold text-[#0a2e2e]">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Items</h3>
              <div className="divide-y divide-gray-100">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-[#0a2e2e]">{item.name}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-[#0a2e2e]">{formatCurrency(item.total)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{formatCurrency(order.shippingFee)}</span></div>
                <div className="flex justify-between font-bold border-t border-gray-100 pt-2"><span>Total</span><span className="text-[var(--color-accent)]">{formatCurrency(order.totalAmount)}</span></div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Shipping To</h3>
              <p className="text-sm font-medium text-[#0a2e2e]">{order.shippingName}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress}</p>
              {(order.shippingCity || order.shippingProvince) && (
                <p className="text-sm text-gray-500">{order.shippingCity}{order.shippingProvince ? `, ${order.shippingProvince}` : ""}</p>
              )}
            </div>

            {order.cancelReason && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-red-600 mb-1">Cancellation Reason</h3>
                <p className="text-sm text-red-700">{order.cancelReason}</p>
              </div>
            )}

            <div className="text-center">
              <button onClick={() => { setOrder(null); setSearched(false); setError(""); setOrderNumberInput(""); setEmailInput(""); }}
                className="text-sm text-[var(--color-accent)] hover:underline">Track another order</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
