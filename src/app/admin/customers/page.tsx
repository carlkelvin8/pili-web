"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  conversationCount: number;
  messageCount: number;
  lastMessageAt: string | null;
  conversations: {
    id: string;
    subject: string;
    status: string;
    createdAt: string;
    _count: { messages: number };
  }[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "messages" | "recent">("messages");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customers", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to load customers");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong loading customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.name?.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "messages") return b.messageCount - a.messageCount;
      if (sortBy === "name") return (a.name || a.email).localeCompare(b.name || b.email);
      if (sortBy === "recent") return (b.lastMessageAt || b.createdAt).localeCompare(a.lastMessageAt || a.createdAt);
      return 0;
    });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0a2e2e] font-[family-name:var(--font-poppins)]">Customers</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your customer relationships and view conversation history.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium">Total Customers</p>
          <p className="text-2xl font-bold text-[#0a2e2e] mt-1">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium">Total Conversations</p>
          <p className="text-2xl font-bold text-[#0a2e2e] mt-1">{customers.reduce((s, c) => s + c.conversationCount, 0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium">Total Messages</p>
          <p className="text-2xl font-bold text-[#0a2e2e] mt-1">{customers.reduce((s, c) => s + c.messageCount, 0)}</p>
        </div>
      </div>

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
        >
          <option value="messages">Sort by Messages</option>
          <option value="name">Sort by Name</option>
          <option value="recent">Sort by Recent</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={fetchCustomers} className="text-sm font-medium text-red-600 hover:text-red-700 underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="text-gray-500 text-sm font-medium">No customers found</p>
              <p className="text-gray-400 text-xs mt-1">{search ? "Try a different search term" : "No customers have contacted you yet."}</p>
            </div>
          ) : (
            filtered.map((customer) => (
              <div key={customer.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[var(--color-primary-light)] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#0a2e2e] font-semibold text-sm">{(customer.name || customer.email)[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#0a2e2e] text-sm truncate">{customer.name || "Anonymous"}</h3>
                      <span className="text-xs text-gray-400">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{customer.conversationCount} conversation{customer.conversationCount !== 1 ? "s" : ""}</span>
                      <span>{customer.messageCount} message{customer.messageCount !== 1 ? "s" : ""}</span>
                      {customer.lastMessageAt && (
                        <span>Last active {new Date(customer.lastMessageAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    {customer.conversations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {customer.conversations.slice(0, 3).map((conv) => (
                          <Link
                            key={conv.id}
                            href={`/admin/messages?conversation=${conv.id}`}
                            className="inline-flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1 transition-colors"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              conv.status === "OPEN" ? "bg-green-500" :
                              conv.status === "CLOSED" ? "bg-gray-400" :
                              conv.status === "PENDING" ? "bg-yellow-500" :
                              "bg-blue-500"
                            }`} />
                            <span className="truncate max-w-[150px]">{conv.subject}</span>
                            <span className="text-gray-400">({conv._count.messages})</span>
                          </Link>
                        ))}
                        {customer.conversations.length > 3 && (
                          <span className="text-xs text-gray-400 self-center">+{customer.conversations.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
