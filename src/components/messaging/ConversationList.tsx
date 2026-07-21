"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Conversation {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string; email: string };
  messages: {
    content: string;
    createdAt: string;
    sender: { name: string; role: string };
  }[];
  unreadCount?: number;
}

interface Props {
  onSelect: (id: string) => void;
  selectedId: string | null;
  refreshKey: number;
}

export default function ConversationList({
  onSelect,
  selectedId,
  refreshKey,
}: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabaseRef = useRef(createClient());

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/conversations", { credentials: "same-origin" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to load conversations");
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from server. Please try again.");
      }
      setConversations(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to load conversations. Please try again.";
      setError(msg);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [refreshKey, fetchConversations]);

  useEffect(() => {
    const sb = supabaseRef.current;
    const channel = sb
      .channel("conversation-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message" },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [fetchConversations]);

  const filtered = conversations
    .filter((c) => filter === "ALL" || c.status === filter)
    .filter(
      (c) =>
        c.subject.toLowerCase().includes(search.toLowerCase()) ||
        c.customer.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.customer.email.toLowerCase().includes(search.toLowerCase())
    );

  function getStatusColor(status: string) {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CLOSED":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  }

  function formatTime(date: string) {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none"
        />
        <div className="flex gap-2 mt-3">
          {["ALL", "OPEN", "PENDING", "CLOSED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-[#0d4d4d] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-gray-400 text-sm gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            Loading conversations...
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={fetchConversations} className="text-sm text-[#3ecbac] hover:text-[#0d4d4d] font-medium">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No conversations found
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                selectedId === conv.id
                  ? "bg-[#f0faf7] border-l-4 border-l-[#3ecbac]"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-[#0a2e2e] truncate">
                      {conv.subject}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(conv.status)}`}
                    >
                      {conv.status}
                    </span>
                    {(conv.unreadCount ?? 0) > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {conv.customer.name} &middot; {conv.customer.email}
                  </p>
                  {conv.messages[0] && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {conv.messages[0].sender.name}:{" "}
                      {conv.messages[0].content}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">
                  {formatTime(conv.updatedAt)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
