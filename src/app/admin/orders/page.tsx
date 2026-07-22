"use client";

import { useState, useEffect, useCallback } from "react";

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string | null;
  shippingProvince: string | null;
  shippingZip: string | null;
  notes: string | null;
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
  customer: { id: string; name: string | null; email: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-700", bg: "bg-yellow-100" },
  CONFIRMED: { label: "Confirmed", color: "text-blue-700", bg: "bg-blue-100" },
  SHIPPED: { label: "Shipped", color: "text-indigo-700", bg: "bg-indigo-100" },
  IN_TRANSIT: { label: "In Transit", color: "text-purple-700", bg: "bg-purple-100" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-orange-700", bg: "bg-orange-100" },
  DELIVERED: { label: "Delivered", color: "text-green-700", bg: "bg-green-100" },
  COMPLETED: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-100" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-100" },
  RETURNED: { label: "Returned", color: "text-gray-700", bg: "bg-gray-100" },
};

const COURIERS = [
  { value: "LBC", label: "LBC Express" },
  { value: "JT_EXPRESS", label: "J&T Express" },
  { value: "GOGOXPRESS", label: "GoGoXpress" },
  { value: "LALAMOVE", label: "Lalamove" },
  { value: "FLASH_EXPRESS", label: "Flash Express" },
];

const STATUS_FLOW = ["PENDING", "CONFIRMED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED"];

function formatCurrency(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [shipModal, setShipModal] = useState<Order | null>(null);
  const [shipForm, setShipForm] = useState({ trackingNumber: "", courier: "", shippingFee: "" });
  const [shipLoading, setShipLoading] = useState(false);

  const [cancelModal, setCancelModal] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filterStatus !== "ALL") params.set("status", filterStatus);
      if (search) params.set("search", search);

      const res = await fetch(`/api/orders?${params}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  function openShip(order: Order) {
    setShipForm({
      trackingNumber: order.trackingNumber || "",
      courier: order.courier || "",
      shippingFee: String(order.shippingFee || 0),
    });
    setShipModal(order);
  }

  async function handleShip() {
    if (!shipModal) return;
    setShipLoading(true);
    try {
      const res = await fetch(`/api/orders/${shipModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          status: "SHIPPED",
          trackingNumber: shipForm.trackingNumber || undefined,
          courier: shipForm.courier || undefined,
          shippingFee: shipForm.shippingFee,
        }),
      });
      if (!res.ok) throw new Error("Failed to ship order");
      setShipModal(null);
      fetchOrders();
    } catch { /* silent */ } finally {
      setShipLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    setStatusLoading(orderId);
    try {
      const body: Record<string, unknown> = { status: newStatus };
      if (newStatus === "CANCELLED") {
        setCancelLoading(true);
        setCancelModal(null);
      }
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchOrders();
    } catch { /* silent */ } finally {
      setStatusLoading(null);
      setCancelLoading(false);
    }
  }

  async function handleCancel() {
    if (!cancelModal) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/orders/${cancelModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: "CANCELLED", cancelReason }),
      });
      if (!res.ok) throw new Error("Failed to cancel order");
      setCancelModal(null);
      setCancelReason("");
      fetchOrders();
    } catch { /* silent */ } finally {
      setCancelLoading(false);
    }
  }

  function getNextStatus(current: string): string | null {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx >= 0 && idx < STATUS_FLOW.length - 1) return STATUS_FLOW[idx + 1];
    return null;
  }

  const stats = {
    total,
    pending: orders.filter((o) => o.status === "PENDING").length,
    shipped: orders.filter((o) => ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status)).length,
    completed: orders.filter((o) => ["DELIVERED", "COMPLETED"].includes(o.status)).length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2e2e] font-[family-name:var(--font-poppins)]">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Orders", value: stats.total, color: "text-[#0a2e2e]" },
          { label: "Pending", value: stats.pending, color: "text-yellow-600" },
          { label: "In Transit", value: stats.shipped, color: "text-indigo-600" },
          { label: "Completed", value: stats.completed, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Search by order #, name, tracking..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]" />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]">
          <option value="ALL">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={fetchOrders} className="text-sm font-medium text-red-600 hover:text-red-700 underline">Retry</button>
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-1/6" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
                <div className="h-4 bg-gray-100 rounded w-1/6" />
              </div>
            ))}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0V6.75a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25v.75m16.5 0v7.5a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25v-7.5" />
          </svg>
          <p className="text-gray-500 text-sm font-medium">No orders found</p>
          <p className="text-gray-400 text-xs mt-1">{search || filterStatus !== "ALL" ? "Try a different filter" : "Orders will appear here when customers place them."}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Order</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Customer</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Items</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Courier</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Tracking</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  const next = getNextStatus(order.status);
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs font-semibold text-[#0a2e2e]">{order.orderNumber}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#0a2e2e] text-xs">{order.shippingName}</p>
                        <p className="text-[10px] text-gray-400">{order.customer.email}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                      <td className="px-5 py-4 text-right font-medium text-[#0a2e2e] text-xs">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600">{order.courier ? COURIERS.find((c) => c.value === order.courier)?.label || order.courier : "—"}</td>
                      <td className="px-5 py-4 font-mono text-[10px] text-gray-500">{order.trackingNumber || "—"}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setDetailOrder(order)} className="p-1.5 text-gray-400 hover:text-[#0d4d4d] hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          {order.status !== "CANCELLED" && order.status !== "COMPLETED" && order.status !== "RETURNED" && (
                            <>
                              {order.status === "PENDING" && (
                                <button onClick={() => handleStatusChange(order.id, "CONFIRMED")} disabled={statusLoading === order.id}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50" title="Confirm Order">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              )}
                              {!["PENDING", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status) && next && (
                                <button onClick={() => handleStatusChange(order.id, next)} disabled={statusLoading === order.id}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50" title={`Move to ${STATUS_CONFIG[next]?.label}`}>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                  </svg>
                                </button>
                              )}
                              <button onClick={() => openShip(order)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Ship / Update Tracking">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                </svg>
                              </button>
                              <button onClick={() => setCancelModal(order)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancel Order">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between text-xs text-gray-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0a2e2e]">Order {detailOrder.orderNumber}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Placed {formatDate(detailOrder.createdAt)}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[detailOrder.status]?.bg} ${STATUS_CONFIG[detailOrder.status]?.color}`}>
                {STATUS_CONFIG[detailOrder.status]?.label}
              </span>
            </div>
            <div className="p-6 space-y-5">
              {/* Shipping */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shipping Information</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-[#0a2e2e]">{detailOrder.shippingName} · {detailOrder.shippingPhone}</p>
                  <p className="text-gray-600 text-xs mt-1">{detailOrder.shippingAddress}</p>
                  {detailOrder.shippingCity && <p className="text-gray-500 text-xs">{detailOrder.shippingCity}{detailOrder.shippingProvince ? `, ${detailOrder.shippingProvince}` : ""} {detailOrder.shippingZip}</p>}
                </div>
              </div>

              {/* Tracking */}
              {(detailOrder.trackingNumber || detailOrder.courier) && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tracking</h3>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center gap-3">
                    {detailOrder.courier && <span className="px-2 py-0.5 bg-[#0a2e2e] text-white rounded text-xs font-medium">{COURIERS.find((c) => c.value === detailOrder.courier)?.label}</span>}
                    <span className="font-mono text-xs text-gray-700">{detailOrder.trackingNumber}</span>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items ({detailOrder.items.length})</h3>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                  {detailOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[#0a2e2e]">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{item.sku} · Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-[#0a2e2e]">{formatCurrency(item.total)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-[#0a2e2e]">{formatCurrency(detailOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="text-[#0a2e2e]">{formatCurrency(detailOrder.shippingFee)}</span></div>
                <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2"><span className="text-[#0a2e2e]">Total</span><span className="text-[#0a2e2e]">{formatCurrency(detailOrder.totalAmount)}</span></div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {detailOrder.shippedAt && <div className="bg-indigo-50 rounded-lg p-2.5"><p className="text-gray-500">Shipped</p><p className="text-indigo-700 font-medium">{formatDate(detailOrder.shippedAt)}</p></div>}
                {detailOrder.deliveredAt && <div className="bg-green-50 rounded-lg p-2.5"><p className="text-gray-500">Delivered</p><p className="text-green-700 font-medium">{formatDate(detailOrder.deliveredAt)}</p></div>}
                {detailOrder.completedAt && <div className="bg-emerald-50 rounded-lg p-2.5"><p className="text-gray-500">Completed</p><p className="text-emerald-700 font-medium">{formatDate(detailOrder.completedAt)}</p></div>}
                {detailOrder.cancelledAt && <div className="bg-red-50 rounded-lg p-2.5"><p className="text-gray-500">Cancelled</p><p className="text-red-700 font-medium">{formatDate(detailOrder.cancelledAt)}</p></div>}
              </div>

              {detailOrder.notes && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</h3>
                  <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-3">{detailOrder.notes}</p>
                </div>
              )}
              {detailOrder.cancelReason && (
                <div>
                  <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">Cancel Reason</h3>
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{detailOrder.cancelReason}</p>
                </div>
              )}
            </div>
            <div className="p-6 pt-0 flex justify-end">
              <button onClick={() => setDetailOrder(null)} className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Ship / Tracking Modal */}
      {shipModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShipModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#0a2e2e]">Ship Order {shipModal.orderNumber}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{shipModal.shippingName} · {formatCurrency(shipModal.totalAmount)}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Courier *</label>
                <select value={shipForm.courier} onChange={(e) => setShipForm({ ...shipForm, courier: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none bg-white">
                  <option value="">Select courier...</option>
                  {COURIERS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number *</label>
                <input type="text" value={shipForm.trackingNumber} onChange={(e) => setShipForm({ ...shipForm, trackingNumber: e.target.value })}
                  placeholder="e.g. 123456789012"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Fee (₱)</label>
                <input type="number" step="0.01" min="0" value={shipForm.shippingFee} onChange={(e) => setShipForm({ ...shipForm, shippingFee: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none" />
              </div>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-3">
              <button onClick={() => setShipModal(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleShip} disabled={shipLoading}
                className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50">
                {shipLoading ? "Saving..." : "Ship Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCancelModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#0a2e2e] mb-1">Cancel Order {cancelModal.orderNumber}</h3>
              <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
              <input type="text" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-transparent outline-none text-center" />
            </div>
            <div className="p-6 pt-0 flex justify-center gap-3">
              <button onClick={() => { setCancelModal(null); setCancelReason(""); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Keep Order</button>
              <button onClick={handleCancel} disabled={cancelLoading}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50">
                {cancelLoading ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
