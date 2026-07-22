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
  const [totalUnread, setTotalUnread] = useState(0);
  const initialLoadDone = useRef(false);
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

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations/unread", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = await res.json();
      setTotalUnread(typeof data.count === "number" ? data.count : 0);
    } catch {
      // silent — not critical
    }
  }, []);

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchUnreadCount();
    }
  }, [fetchUnreadCount, refreshKey]);

  // Real-time notification listener
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const sb = supabaseRef.current;
    const channel = sb
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message" },
        (payload) => {
          fetchUnreadCount();
          setRefreshKey((k) => k + 1);

          if ("Notification" in window && Notification.permission === "granted") {
            const newMsg = payload.new as Record<string, unknown> | undefined;
            const convId = newMsg?.conversationId as string | undefined;
            if (convId) {
              fetch(`/api/conversations/${convId}`, { credentials: "same-origin" })
                .then((res) => res.ok ? res.json() : null)
                .then((conv) => {
                  if (!conv) return;
                  const customer = conv.customer as Record<string, unknown> | undefined;
                  const content = (newMsg?.content as string) || "New message";
                  new Notification("New message received", {
                    body: ((customer?.name as string) || "Customer") + ": " + content,
                    icon: "/logo.png",
                  });
                })
                .catch(() => {});
            }
          }
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [fetchUnreadCount]);

  const fetchConversationInfo = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { credentials: "same-origin" });
      if (!res.ok) return;
      const conv = await res.json();
      setConversationInfo({
        subject: conv.subject,
        status: conv.status,
        customer: conv.customer,
      });
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selectedId) fetchConversationInfo(selectedId);
  }, [selectedId, fetchConversationInfo]);

  async function handleStatusChange(status: string) {
    if (!selectedId) return;
    try {
      await fetch("/api/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id: selectedId, status }),
      });
      fetchConversationInfo(selectedId);
      setRefreshKey((k) => k + 1);
      fetchUnreadCount();
    } catch {
      // silent
    }
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
    <div className="h-[calc(100vh-49px)] flex flex-col bg-gray-50">
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
