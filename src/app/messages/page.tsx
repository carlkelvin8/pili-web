"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ConversationList from "@/components/messaging/ConversationList";
import MessageThread from "@/components/messaging/MessageThread";
import NewConversationModal from "@/components/messaging/NewConversationModal";

export default function CustomerMessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [emailEntered, setEmailEntered] = useState(false);
  const [conversationInfo, setConversationInfo] = useState<{
    subject: string;
    status: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pili_customer");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.name && data.email) {
          setCustomerName(data.name);
          setCustomerEmail(data.email);
          setEmailEntered(true);
        }
      }
    } catch {
      localStorage.removeItem("pili_customer");
    }
  }, []);

  const fetchConversationInfo = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/conversations/${id}`);
        if (!res.ok) return;
        const conv = await res.json();
        setConversationInfo({ subject: conv.subject, status: conv.status });
      } catch { /* silent */ }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selectedId && customerEmail) fetchConversationInfo(selectedId);
  }, [selectedId, customerEmail, fetchConversationInfo]);

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(
      "pili_customer",
      JSON.stringify({ email: customerEmail, name: customerName })
    );
    setEmailEntered(true);
  }

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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a2e2e]">
        <div className="text-white text-sm">Loading...</div>
      </div>
    );
  }

  if (!emailEntered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a2e2e] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#0d4d4d] font-[family-name:var(--font-poppins)]">
              Pili AdheSeal
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Enter your details to access your messages
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none transition-all text-[#0a2e2e]"
                placeholder="Juan Dela Cruz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none transition-all text-[#0a2e2e]"
                placeholder="juan@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Continue
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-[#3ecbac] hover:underline"
            >
              Admin? Login here
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-[#0a2e2e] text-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-lg font-bold font-[family-name:var(--font-poppins)]"
          >
            Pili AdheSeal
          </Link>
          <span className="text-[#3ecbac] text-sm">Messages</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-300">{customerEmail}</span>
          <button
            onClick={() => {
              localStorage.removeItem("pili_customer");
              setEmailEntered(false);
              setCustomerEmail("");
              setCustomerName("");
              setSelectedId(null);
            }}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Switch Account
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200">
            <NewConversationModal
              onCreated={() => setRefreshKey((k) => k + 1)}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <ConversationList
              onSelect={setSelectedId}
              selectedId={selectedId}
              refreshKey={refreshKey}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedId ? (
            <>
              {conversationInfo && (
                <div className="bg-white border-b border-gray-200 px-6 py-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[#0a2e2e]">
                      {conversationInfo.subject}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(conversationInfo.status)}`}
                    >
                      {conversationInfo.status}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <MessageThread
                  conversationId={selectedId}
                  currentUserEmail={customerEmail}
                  userRole="CUSTOMER"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-lg font-medium">
                  Welcome, {customerName}!
                </p>
                <p className="text-sm mt-1">
                  Select a conversation or start a new inquiry
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
