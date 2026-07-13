"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ConversationList from "@/components/messaging/ConversationList";
import MessageThread from "@/components/messaging/MessageThread";

export default function AdminMessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [conversationInfo, setConversationInfo] = useState<{
    subject: string;
    status: string;
    customer: { name: string; email: string };
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabaseRef.current.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? "");
      }
    }
    getUser();
  }, []);

  const fetchConversationInfo = useCallback(async (id: string) => {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    const conv = data.find((c: { id: string }) => c.id === id);
    if (conv) {
      setConversationInfo({
        subject: conv.subject,
        status: conv.status,
        customer: conv.customer,
      });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selectedId) fetchConversationInfo(selectedId);
  }, [selectedId, fetchConversationInfo]);

  async function handleStatusChange(status: string) {
    if (!selectedId) return;
    await fetch("/api/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedId, status }),
    });
    fetchConversationInfo(selectedId);
    setRefreshKey((k) => k + 1);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-700 border-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "CLOSED":
        return "bg-gray-100 text-gray-500 border-gray-300";
      default:
        return "bg-gray-100 text-gray-500 border-gray-300";
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-[#0a2e2e] text-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold font-[family-name:var(--font-poppins)]">
            Pili AdheSeal
          </h1>
          <span className="text-[#3ecbac] text-sm">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-300">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-[#0a2e2e] font-[family-name:var(--font-poppins)]">
              Conversations
            </h2>
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
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="font-semibold text-[#0a2e2e]">
                      {conversationInfo.subject}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {conversationInfo.customer.name} &middot;{" "}
                      {conversationInfo.customer.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(conversationInfo.status)}`}
                    >
                      {conversationInfo.status}
                    </span>
                    <select
                      value={conversationInfo.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#3ecbac] outline-none"
                    >
                      <option value="OPEN">Open</option>
                      <option value="PENDING">Pending</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <MessageThread
                  conversationId={selectedId}
                  currentUserEmail={userEmail}
                  userRole="ADMIN"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">
                  Choose from the list to start replying
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
