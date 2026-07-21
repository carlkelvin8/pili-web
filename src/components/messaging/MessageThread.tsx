"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface Reaction {
  id: string;
  emoji: string;
  user: { id: string; name: string; email: string };
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  isDeleted?: boolean;
  editedAt?: string;
  sender: { id: string; name: string; email: string; role: string };
  reactions: Reaction[];
}

interface Props {
  conversationId: string;
  currentUserEmail: string;
  userRole: "ADMIN" | "CUSTOMER";
}

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
  const [contextMenu, setContextMenu] = useState<{ messageId: string; x: number; y: number } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [reactionPicker, setReactionPicker] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

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
      if (!Array.isArray(data)) throw new Error("Unexpected response from server.");
      setMessages(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to load messages.";
      setLoadError(msg);
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ content, conversationId, senderEmail: currentUserEmail, senderRole: userRole }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
      }
    } catch { /* silent */ }
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
        body: JSON.stringify({ messageId, emoji, userEmail: currentUserEmail }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== messageId) return m;
            const existing = m.reactions.find(
              (r) => r.emoji === emoji && r.user.email === currentUserEmail
            );
            if (existing) {
              return { ...m, reactions: m.reactions.filter((r) => r.id !== existing.id) };
            }
            return {
              ...m,
              reactions: [
                ...m.reactions,
                { id: `temp-${Date.now()}`, emoji, user: { id: "me", name: currentUserEmail.split("@")[0], email: currentUserEmail } },
              ],
            };
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
        body: JSON.stringify({ id: messageId, content: editContent.trim(), userEmail: currentUserEmail }),
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
      const res = await fetch(`/api/messages?id=${messageId}&userEmail=${encodeURIComponent(currentUserEmail)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    } catch { /* silent */ }
  }

  function handleContextMenu(e: React.MouseEvent, msg: Message) {
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 250);
    setContextMenu({ messageId: msg.id, x, y });
    setReactionPicker(null);
  }

  function handleDoubleClick(msg: Message) {
    if (msg.isDeleted) return;
    setReactionPicker(reactionPicker === msg.id ? null : msg.id);
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const date = formatDate(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) last.messages.push(msg);
    else groupedMessages.push({ date, messages: [msg] });
  });

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadError ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <p className="text-sm text-red-500">{loadError}</p>
            <button onClick={fetchMessages} className="text-sm text-[#3ecbac] hover:text-[#0d4d4d] font-medium">Try again</button>
          </div>
        ) : groupedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">No messages yet</div>
        ) : groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="flex items-center justify-center my-4">
              <span className="text-[10px] text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">{group.date}</span>
            </div>
            {group.messages.map((msg) => {
              const isOwn = (userRole === "ADMIN" && msg.sender.role === "ADMIN") || (userRole === "CUSTOMER" && msg.sender.email === currentUserEmail);
              const isDeleted = msg.isDeleted;
              const canAct = !isDeleted && canEditUnsend(msg.createdAt) && msg.sender.email === currentUserEmail;
              const grouped = groupReactions(msg.reactions);

              return (
                <div
                  key={msg.id}
                  className={`flex mb-3 ${isOwn ? "justify-end" : "justify-start"}`}
                  onContextMenu={(e) => !isDeleted && handleContextMenu(e, msg)}
                  onDoubleClick={() => !isDeleted && handleDoubleClick(msg)}
                >
                  <div className={`max-w-[75%] group relative ${isOwn ? "items-end" : "items-start"}`}>
                    {/* Message bubble */}
                    {!isDeleted ? (
                      <div
                        className={`rounded-2xl px-4 py-2.5 relative ${
                          isOwn
                            ? "bg-[#0d4d4d] text-white rounded-br-md"
                            : "bg-gray-100 text-[#0a2e2e] rounded-bl-md"
                        }`}
                      >
                        {!isOwn && (
                          <p className="text-[10px] font-semibold text-[#3ecbac] mb-1">{msg.sender.name}</p>
                        )}

                        {editingId === msg.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEdit(msg.id);
                                if (e.key === "Escape") { setEditingId(null); setEditContent(""); }
                              }}
                              className="flex-1 bg-white/20 text-white placeholder-white/50 text-sm px-2 py-1 rounded-lg outline-none border border-white/30"
                            />
                            <button onClick={() => handleEdit(msg.id)} className="text-[10px] text-[#3ecbac] font-semibold hover:underline">Save</button>
                            <button onClick={() => { setEditingId(null); setEditContent(""); }} className="text-[10px] text-white/60 hover:underline">Cancel</button>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        )}

                        <div className="flex items-center gap-1.5 mt-1">
                          <p className={`text-[10px] ${isOwn ? "text-white/60" : "text-gray-400"}`}>
                            {formatTime(msg.createdAt)}
                            {msg.editedAt && " (edited)"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl px-4 py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-bl-md">
                        <p className="text-xs text-gray-400 italic">This message was unsent</p>
                      </div>
                    )}

                    {/* Reactions display */}
                    {grouped.length > 0 && !isDeleted && (
                      <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                        {grouped.map((g) => {
                          const hasOwn = g.users.some((u) => {
                            const emailPrefix = currentUserEmail.split("@")[0];
                            return u === emailPrefix || currentUserEmail === u;
                          });
                          return (
                            <button
                              key={g.emoji}
                              onClick={() => handleReaction(msg.id, g.emoji)}
                              className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full border transition-colors ${
                                hasOwn
                                  ? "bg-[#3ecbac]/20 border-[#3ecbac]/40 text-[#0d4d4d]"
                                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              <span>{g.emoji}</span>
                              <span className="font-medium">{g.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Context Menu */}
      {contextMenu && (() => {
        const msg = messages.find((m) => m.id === contextMenu.messageId);
        if (!msg || msg.isDeleted) return null;
        const canAct = msg.sender.email === currentUserEmail && canEditUnsend(msg.createdAt);
        return (
          <div
            className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setReactionPicker(contextMenu.messageId);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
            >
              <span>😀</span> React
            </button>
            {canAct && (
              <>
                <button
                  onClick={() => {
                    setEditingId(contextMenu.messageId);
                    setEditContent(msg.content);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                  Edit message
                </button>
                <button
                  onClick={() => handleUnsend(contextMenu.messageId)}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  Unsend
                </button>
              </>
            )}
            <div className="border-t border-gray-100 mt-1 pt-1 px-3 py-1.5">
              <p className="text-[10px] text-gray-400">Right-click any message to react</p>
            </div>
          </div>
        );
      })()}

      {/* Quick Reaction Picker */}
      {reactionPicker && (
        <div
          className="fixed z-50 bg-white rounded-full shadow-xl border border-gray-200 px-2 py-1.5 flex items-center gap-0.5 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: (() => {
              const msg = messages.find((m) => m.id === reactionPicker);
              if (!msg) return "50%";
              const isOwn = msg.sender.email === currentUserEmail;
              return isOwn ? "calc(100% - 220px)" : "20px";
            })(),
            bottom: "80px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(reactionPicker, emoji)}
              className="w-9 h-9 flex items-center justify-center text-xl hover:bg-gray-100 rounded-full transition-all hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
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
