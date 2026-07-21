"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { name: string; email: string; role: string };
}

interface Conversation {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
  messages: { content: string; createdAt: string; sender: { name: string; role: string } }[];
}

type View = "bubble" | "info" | "list" | "chat";

export default function FloatingChat() {
  const [view, setView] = useState<View>("bubble");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const saved = localStorage.getItem("pili_customer");
    if (saved) {
      const data = JSON.parse(saved);
      setName(data.name);
      setEmail(data.email);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!email) return;
    const res = await fetch(`/api/conversations?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    setConversations(data);
  }, [email]);

  useEffect(() => {
    if (view === "list") fetchConversations();
  }, [view, fetchConversations]);

  const fetchMessages = useCallback(async () => {
    if (!selectedConvId) return;
    const res = await fetch(`/api/messages?conversationId=${selectedConvId}`);
    const data = await res.json();
    setMessages(data);
  }, [selectedConvId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!selectedConvId) return;
    const sb = supabaseRef.current;
    const channel = sb
      .channel(`float-msg-${selectedConvId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message", filter: `conversationId=eq.${selectedConvId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("pili_customer", JSON.stringify({ name, email }));
    setView("list");
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedConvId) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, conversationId: selectedConvId, senderEmail: email, senderRole: "CUSTOMER" }),
    });
    setSending(false);
  }

  async function handleNewConversation(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim() || !newBody.trim()) return;
    setLoading(true);
    const convRes = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: newSubject, customerName: name, customerEmail: email }),
    });
    const conv = await convRes.json();
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newBody, conversationId: conv.id, senderEmail: email, senderRole: "CUSTOMER" }),
    });
    setNewSubject("");
    setNewBody("");
    setShowNewForm(false);
    setLoading(false);
    setSelectedConvId(conv.id);
    setView("chat");
  }

  function handleBack() {
    if (view === "chat") {
      setSelectedConvId(null);
      setView("list");
    } else if (view === "list") {
      setView("bubble");
    } else if (view === "info") {
      setView("bubble");
    }
  }

  function openChat() {
    if (email) {
      setView("list");
    } else {
      setView("info");
    }
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }

  if (view === "bubble") {
    return (
      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        aria-label="Open chat"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ height: "500px" }}>
      {/* Header */}
      <div className="bg-[#0a2e2e] text-white px-4 py-3 flex items-center gap-3 shrink-0">
        {view !== "info" && (
          <button onClick={handleBack} className="text-white/70 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-sm font-[family-name:var(--font-poppins)]">
            {view === "info" && "Chat with Us"}
            {view === "list" && "Your Inquiries"}
            {view === "chat" && (conversations.find((c) => c.id === selectedConvId)?.subject || "Chat")}
          </h3>
          {view === "list" && <p className="text-[10px] text-white/60">{name}</p>}
        </div>
        <button onClick={() => setView("bubble")} className="text-white/70 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Info form */}
        {view === "info" && (
          <form onSubmit={handleInfoSubmit} className="p-5 space-y-4">
            <p className="text-xs text-gray-500">Enter your details to start chatting.</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Your email"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none"
            />
            <button
              type="submit"
              className="w-full bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              Start Chatting
            </button>
          </form>
        )}

        {/* Conversation list */}
        {view === "list" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && !showNewForm && (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No inquiries yet
                </div>
              )}
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => { setSelectedConvId(conv.id); setView("chat"); }}
                  className="w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-[#0a2e2e] truncate flex-1">{conv.subject}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      conv.status === "OPEN" ? "bg-green-100 text-green-700" :
                      conv.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>{conv.status}</span>
                  </div>
                  {conv.messages[0] && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {conv.messages[conv.messages.length - 1].sender.name}: {conv.messages[conv.messages.length - 1].content}
                    </p>
                  )}
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-gray-200">
              {showNewForm ? (
                <form onSubmit={handleNewConversation} className="space-y-2">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    required
                    placeholder="Subject"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none"
                  />
                  <textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    required
                    rows={2}
                    placeholder="Your message..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowNewForm(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white py-2 rounded-lg text-sm disabled:opacity-50">
                      {loading ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowNewForm(true)}
                  className="w-full bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  + New Inquiry
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chat view */}
        {view === "chat" && selectedConvId && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isOwn = msg.sender.email === email;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      isOwn ? "bg-[#0d4d4d] text-white rounded-br-md" : "bg-gray-100 text-[#0a2e2e] rounded-bl-md"
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isOwn ? "text-white/60" : "text-gray-400"}`}>{formatTime(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-full border border-gray-300 text-sm focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {sending ? "..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
