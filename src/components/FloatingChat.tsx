"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Reaction {
  id: string;
  emoji: string;
  user: { id: string; name: string; email: string };
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isDeleted?: boolean;
  editedAt?: string;
  sender: { name: string; email: string; role: string };
  reactions: Reaction[];
  attachmentUrl?: string;
  attachmentName?: string;
}

interface Conversation {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
  messages: { content: string; createdAt: string; sender: { name: string; role: string } }[];
}

type View = "bubble" | "info" | "list" | "chat";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

function canEditUnsend(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 5 * 60 * 1000;
}

function groupReactions(reactions: Reaction[]) {
  const map: Record<string, { emoji: string; count: number; users: string[]; hasOwn: boolean }> = {};
  for (const r of reactions) {
    if (!map[r.emoji]) map[r.emoji] = { emoji: r.emoji, count: 0, users: [], hasOwn: false };
    map[r.emoji].count++;
    map[r.emoji].users.push(r.user.name || r.user.email.split("@")[0]);
  }
  return Object.values(map);
}

export default function FloatingChat() {
  const [view, setView] = useState<View>("bubble");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [bodyError, setBodyError] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());
  const [contextMenu, setContextMenu] = useState<{ messageId: string; x: number; y: number } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [reactionPicker, setReactionPicker] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // File attachment
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Typing indicator
  const [adminTyping, setAdminTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pili_customer");
    if (saved) {
      const data = JSON.parse(saved);
      setName(data.name);
      setEmail(data.email);
    }
  }, []);

  useEffect(() => {
    function close() { setContextMenu(null); setReactionPicker(null); }
    if (contextMenu || reactionPicker) {
      window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }
  }, [contextMenu, reactionPicker]);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  const fetchConversations = useCallback(async () => {
    if (!email) return;
    try {
      const res = await fetch(`/api/conversations?email=${encodeURIComponent(email)}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      setConversations([]);
    }
  }, [email]);

  useEffect(() => {
    if (view === "list") fetchConversations();
  }, [view, fetchConversations]);

  const fetchMessages = useCallback(async () => {
    if (!selectedConvId) return;
    try {
      const res = await fetch(`/api/messages?conversationId=${selectedConvId}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    }
  }, [selectedConvId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Supabase realtime + typing channel
  useEffect(() => {
    if (!selectedConvId) return;
    const sb = supabaseRef.current;
    const channel = sb
      .channel(`float-msg-${selectedConvId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "Message", filter: `conversationId=eq.${selectedConvId}` }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMsg.id)) return prev;
          return [...prev, { ...newMsg, reactions: [] }];
        });
        setAdminTyping(false);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "Message" }, () => {
        fetchMessages();
      })
      .on("broadcast", { event: "typing" }, (payload) => {
        const data = payload.payload as { email?: string; name?: string };
        if (data.email && data.email !== email) {
          setAdminTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setAdminTyping(false), 4000);
        }
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [selectedConvId, fetchMessages, email]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function validateInfo(): boolean {
    let valid = true;
    if (!name.trim()) { setNameError("Please enter your name"); valid = false; } else if (name.trim().length < 2) { setNameError("Name must be at least 2 characters"); valid = false; } else { setNameError(""); }
    if (!email.trim()) { setEmailError("Please enter your email"); valid = false; } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError("Please enter a valid email"); valid = false; } else { setEmailError(""); }
    return valid;
  }

  function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateInfo()) return;
    localStorage.setItem("pili_customer", JSON.stringify({ name: name.trim(), email: email.trim() }));
    setView("list");
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if ((!newMessage.trim() && !attachmentFile) || sending || !selectedConvId) return;
    setSending(true);
    setSendError("");
    const content = newMessage.trim();
    setNewMessage("");

    let attachmentUrl = "";
    let attachmentName = "";

    if (attachmentFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", attachmentFile);
        const uploadRes = await fetch("/api/chat/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachmentUrl = uploadData.url;
          attachmentName = uploadData.name;
        }
      } catch { /* silent */ }
      setUploading(false);
      setAttachmentFile(null);
    }

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          content,
          conversationId: selectedConvId,
          senderEmail: email,
          senderRole: "CUSTOMER",
          attachmentUrl: attachmentUrl || undefined,
          attachmentName: attachmentName || undefined,
        }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
      } else {
        const err = await res.json();
        setSendError(err.error || "Message couldn't be sent.");
        setNewMessage(content);
      }
    } catch {
      setSendError("Unable to send. Please check your internet connection.");
      setNewMessage(content);
    }
    setSending(false);
  }

  async function handleReaction(messageId: string, emoji: string) {
    setReactionPicker(null);
    setContextMenu(null);
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ messageId, emoji, userEmail: email }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== messageId) return m;
            const existing = m.reactions.find((r) => r.emoji === emoji && r.user.email === email);
            if (existing) return { ...m, reactions: m.reactions.filter((r) => r.id !== existing.id) };
            return { ...m, reactions: [...m.reactions, { id: `temp-${Date.now()}`, emoji, user: { id: "me", name: name.split("@")[0], email } }] };
          })
        );
      }
    } catch { /* silent */ }
  }

  async function handleEdit(messageId: string) {
    if (!editContent.trim()) return;
    try {
      const res = await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id: messageId, content: editContent.trim(), userEmail: email }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
      }
    } catch { /* silent */ }
    setEditingId(null);
    setEditContent("");
  }

  async function handleUnsend(messageId: string) {
    setContextMenu(null);
    try {
      const res = await fetch(`/api/messages?id=${messageId}&userEmail=${encodeURIComponent(email)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (res.ok) setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch { /* silent */ }
  }

  function handleContextMenu(e: React.MouseEvent, msg: Message) {
    e.preventDefault();
    if (msg.isDeleted) return;
    if (msg.sender.email !== email) return;
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 250);
    setContextMenu({ messageId: msg.id, x, y });
  }

  function validateNewConversation(): boolean {
    let valid = true;
    if (!newSubject.trim()) { setSubjectError("Please enter a subject"); valid = false; } else { setSubjectError(""); }
    if (!newBody.trim()) { setBodyError("Please enter your message"); valid = false; } else if (newBody.trim().length < 3) { setBodyError("Message must be at least 3 characters"); valid = false; } else { setBodyError(""); }
    return valid;
  }

  async function handleNewConversation(e: React.FormEvent) {
    e.preventDefault();
    if (!validateNewConversation()) return;
    setLoading(true);
    setCreateError("");
    try {
      const convRes = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ subject: newSubject.trim(), customerName: name.trim(), customerEmail: email }),
      });
      if (!convRes.ok) {
        const err = await convRes.json();
        setCreateError(err.error || "Couldn't create inquiry. Please try again.");
        setLoading(false);
        return;
      }
      const conv = await convRes.json();
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ content: newBody.trim(), conversationId: conv.id, senderEmail: email, senderRole: "CUSTOMER" }),
      });
      setNewSubject("");
      setNewBody("");
      setShowNewForm(false);
      setLoading(false);
      setSelectedConvId(conv.id);
      setView("chat");
    } catch {
      setCreateError("Unable to create inquiry. Please check your internet connection.");
      setLoading(false);
    }
  }

  function handleBack() {
    if (view === "chat") { setSelectedConvId(null); setEditingId(null); setReactionPicker(null); setContextMenu(null); setView("list"); }
    else if (view === "list") setView("bubble");
    else if (view === "info") setView("bubble");
  }

  function openChat() { email ? setView("list") : setView("info"); }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }

  if (view === "bubble") {
    return (
      <button onClick={openChat} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110" aria-label="Open chat">
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
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
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === "info" && (
          <form onSubmit={handleInfoSubmit} className="p-5 space-y-4">
            <p className="text-xs text-gray-500">Enter your details to start chatting.</p>
            <div>
              <input type="text" value={name} onChange={(e) => { setName(e.target.value); setNameError(""); }} placeholder="Your name" className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none ${nameError ? "border-red-400" : "border-gray-300"}`} />
              {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
            </div>
            <div>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(""); }} placeholder="Your email" className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none ${emailError ? "border-red-400" : "border-gray-300"}`} />
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            </div>
            <button type="submit" className="w-full bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">Start Chatting</button>
          </form>
        )}

        {view === "list" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && !showNewForm && (
                <div className="p-8 text-center text-gray-400 text-sm">No inquiries yet. Start one below!</div>
              )}
              {conversations.map((conv) => (
                <button key={conv.id} onClick={() => { setSelectedConvId(conv.id); setView("chat"); }} className="w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-[#0a2e2e] truncate flex-1">{conv.subject}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${conv.status === "OPEN" ? "bg-green-100 text-green-700" : conv.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>{conv.status}</span>
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
                  <div>
                    <input type="text" value={newSubject} onChange={(e) => { setNewSubject(e.target.value); setSubjectError(""); }} placeholder="Subject" className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none ${subjectError ? "border-red-400" : "border-gray-300"}`} />
                    {subjectError && <p className="text-xs text-red-500 mt-1">{subjectError}</p>}
                  </div>
                  <div>
                    <textarea value={newBody} onChange={(e) => { setNewBody(e.target.value); setBodyError(""); }} rows={2} placeholder="Your message..." className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none resize-none ${bodyError ? "border-red-400" : "border-gray-300"}`} />
                    {bodyError && <p className="text-xs text-red-500 mt-1">{bodyError}</p>}
                  </div>
                  {createError && (
                    <div className="flex items-start gap-2 bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2 border border-red-200">
                      <span>{createError}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setShowNewForm(false); setCreateError(""); }} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white py-2 rounded-lg text-sm disabled:opacity-50">
                      {loading ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowNewForm(true)} className="w-full bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">+ New Inquiry</button>
              )}
            </div>
          </div>
        )}

        {view === "chat" && selectedConvId && (
          <div className="flex flex-col h-full relative">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isOwn = msg.sender.email === email;
                const isDeleted = msg.isDeleted;
                const grouped = groupReactions(msg.reactions);

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    onContextMenu={(e) => handleContextMenu(e, msg)}
                  >
                    <div className="max-w-[80%] relative">
                      {!isDeleted ? (
                        <>
                          <div className={`rounded-2xl px-4 py-2.5 ${isOwn ? "bg-[#0d4d4d] text-white rounded-br-md" : "bg-gray-100 text-[#0a2e2e] rounded-bl-md"}`}>
                            {editingId === msg.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") handleEdit(msg.id); if (e.key === "Escape") { setEditingId(null); setEditContent(""); } }}
                                  className="flex-1 bg-white/20 text-white placeholder-white/50 text-sm px-2 py-1 rounded-lg outline-none border border-white/30 min-w-0"
                                />
                                <button onClick={() => handleEdit(msg.id)} className="text-[10px] text-[#3ecbac] font-semibold shrink-0">Save</button>
                                <button onClick={() => { setEditingId(null); setEditContent(""); }} className="text-[10px] text-white/60 shrink-0">Cancel</button>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                {msg.attachmentUrl && (
                                  <div className="mt-2">
                                    {msg.attachmentUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                                      <img src={msg.attachmentUrl} alt={msg.attachmentName || "Attachment"} className="max-w-[180px] max-h-[120px] rounded-lg object-cover" />
                                    ) : (
                                      <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border ${
                                          isOwn ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                                        }`}>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                        {msg.attachmentName || "File"}
                                      </a>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                            <p className={`text-[10px] mt-1 ${isOwn ? "text-white/60" : "text-gray-400"}`}>
                              {formatTime(msg.createdAt)}
                              {msg.editedAt && " (edited)"}
                            </p>
                          </div>
                          {grouped.length > 0 && (
                            <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                              {grouped.map((g) => {
                                const hasOwn = g.users.some((u) => u === email || u === name.split("@")[0]);
                                return (
                                  <button
                                    key={g.emoji}
                                    onClick={() => handleReaction(msg.id, g.emoji)}
                                    className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
                                      hasOwn ? "bg-[#3ecbac]/20 border-[#3ecbac]/40 text-[#0d4d4d]" : "bg-gray-50 border-gray-200 text-gray-600"
                                    }`}
                                  >
                                    <span>{g.emoji}</span>
                                    <span className="font-medium">{g.count}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="rounded-2xl px-4 py-2.5 bg-gray-50 border border-dashed border-gray-300">
                          <p className="text-xs text-gray-400 italic">This message was unsent</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {adminTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Context Menu */}
            {contextMenu && (() => {
              const msg = messages.find((m) => m.id === contextMenu.messageId);
              if (!msg || msg.isDeleted || msg.sender.email !== email) return null;
              const canAct = canEditUnsend(msg.createdAt);
              return (
                <div className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 min-w-[160px]" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { setReactionPicker(contextMenu.messageId); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <span>😀</span> React
                  </button>
                  {canAct && (
                    <>
                      <button onClick={() => { setEditingId(contextMenu.messageId); setEditContent(msg.content); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                        Edit
                      </button>
                      <button onClick={() => handleUnsend(contextMenu.messageId)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        Unsend
                      </button>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Quick Reaction Picker */}
            {reactionPicker && (
              <div className="fixed z-50 bg-white rounded-full shadow-xl border border-gray-200 px-2 py-1.5 flex items-center gap-0.5" style={{ left: "50%", bottom: "80px", transform: "translateX(-50%)" }} onClick={(e) => e.stopPropagation()}>
                {QUICK_REACTIONS.map((emoji) => (
                  <button key={emoji} onClick={() => handleReaction(reactionPicker, emoji)} className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-full transition-all hover:scale-125">
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {sendError && (
              <div className="mx-3 mb-2 flex items-start gap-2 bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2 border border-red-200">
                <span>{sendError}</span>
              </div>
            )}

            {/* Attachment preview */}
            {attachmentFile && (
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 flex-1 min-w-0">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="truncate">{attachmentFile.name}</span>
                  <button onClick={() => setAttachmentFile(null)} className="text-gray-400 hover:text-gray-600 shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white shrink-0">
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAttachmentFile(file);
                  e.target.value = "";
                }} />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-[#0d4d4d] border border-gray-300 rounded-full transition-colors"
                  title="Attach file">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.939A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                  </svg>
                </button>
                <input type="text" value={newMessage} onChange={(e) => { setNewMessage(e.target.value); setSendError(""); }} placeholder="Type a message..." className="flex-1 px-3 py-2 rounded-full border border-gray-300 text-sm focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none" />
                <button type="submit" disabled={(!newMessage.trim() && !attachmentFile) || sending} className="bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50">
                  {sending || uploading ? "..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
