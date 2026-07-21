"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Props {
  conversationId: string;
  currentUserEmail: string;
  userRole: "ADMIN" | "CUSTOMER";
}

export default function MessageThread({
  conversationId,
  currentUserEmail,
  userRole,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  const fetchMessages = useCallback(async () => {
    try {
      setLoadError("");
      const res = await fetch(
        `/api/messages?conversationId=${conversationId}`,
        { credentials: "same-origin" }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to load messages");
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from server.");
      }
      setMessages(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to load messages. Please try again.";
      setLoadError(msg);
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const sb = supabaseRef.current;
    const channel = sb
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        conversationId,
        senderEmail: currentUserEmail,
        senderRole: userRole,
      }),
    });

    setSending(false);
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const date = formatDate(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      groupedMessages.push({ date, messages: [msg] });
    }
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadError ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <p className="text-sm text-red-500">{loadError}</p>
            <button onClick={fetchMessages} className="text-sm text-[#3ecbac] hover:text-[#0d4d4d] font-medium">Try again</button>
          </div>
        ) : groupedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet
          </div>
        ) : groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="flex items-center justify-center my-4">
              <span className="text-[10px] text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
                {group.date}
              </span>
            </div>
            {group.messages.map((msg) => {
              const isOwn =
                (userRole === "ADMIN" && msg.sender.role === "ADMIN") ||
                (userRole === "CUSTOMER" &&
                  msg.sender.email === currentUserEmail);
              return (
                <div
                  key={msg.id}
                  className={`flex mb-3 ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? "bg-[#0d4d4d] text-white rounded-br-md"
                        : "bg-gray-100 text-[#0a2e2e] rounded-bl-md"
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-[10px] font-semibold text-[#3ecbac] mb-1">
                        {msg.sender.name}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isOwn ? "text-white/60" : "text-gray-400"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 border-t border-gray-200 bg-white"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 text-sm focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
