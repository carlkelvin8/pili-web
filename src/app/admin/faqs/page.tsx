"use client";

import { useState, useEffect, useCallback } from "react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

const EMPTY_FORM = { question: "", answer: "", isActive: true };

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editFaq, setEditFaq] = useState<FAQ | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteFaq, setDeleteFaq] = useState<FAQ | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandPreview, setExpandPreview] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ admin: "true" });
      if (search) params.set("search", search);

      const res = await fetch(`/api/faqs?${params}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to load FAQs");
      const data = await res.json();
      setFaqs(Array.isArray(data.faqs) ? data.faqs : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load FAQs.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  function openAdd() {
    setEditFaq(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(f: FAQ) {
    setEditFaq(f);
    setForm({ question: f.question, answer: f.answer, isActive: f.isActive });
    setFormError("");
    setShowForm(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const url = editFaq ? `/api/faqs/${editFaq.id}` : "/api/faqs";
      const method = editFaq ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save FAQ");
      }
      setShowForm(false);
      fetchFaqs();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save FAQ.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteFaq) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/faqs/${deleteFaq.id}`, { method: "DELETE", credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteFaq(null);
      fetchFaqs();
    } catch { /* silent */ } finally {
      setDeleteLoading(false);
    }
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    const idx = faqs.findIndex((f) => f.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= faqs.length) return;

    const a = faqs[idx];
    const b = faqs[swapIdx];

    try {
      await Promise.all([
        fetch(`/api/faqs/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ sortOrder: b.sortOrder }) }),
        fetch(`/api/faqs/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ sortOrder: a.sortOrder }) }),
      ]);
      fetchFaqs();
    } catch { /* silent */ }
  }

  async function handleToggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/faqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ isActive: !current }),
      });
      fetchFaqs();
    } catch { /* silent */ }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2e2e] font-[family-name:var(--font-poppins)]">FAQ Management</h1>
          <p className="text-sm text-gray-500 mt-1">{faqs.length} total · {faqs.filter((f) => f.isActive).length} published</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#0d4d4d] hover:bg-[#1a8a6e] rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add FAQ
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Search FAQs..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={fetchFaqs} className="text-sm font-medium text-red-600 hover:text-red-700 underline">Retry</button>
        </div>
      )}

      {/* FAQ List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          <p className="text-gray-500 text-sm font-medium">No FAQs found</p>
          <p className="text-gray-400 text-xs mt-1">{search ? "Try a different search" : "Add your first FAQ to get started."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isExpanded = expandPreview === faq.id;
            return (
              <div key={faq.id} className={`bg-white rounded-xl border border-gray-200 transition-all ${!faq.isActive ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3 p-4">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button onClick={() => handleReorder(faq.id, "up")} disabled={idx === 0}
                      className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <button onClick={() => handleReorder(faq.id, "down")} disabled={idx === faqs.length - 1}
                      className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <button onClick={() => setExpandPreview(isExpanded ? null : faq.id)}
                      className="text-left w-full">
                      <p className={`text-sm font-semibold ${faq.isActive ? "text-[#0a2e2e]" : "text-gray-400"}`}>{faq.question}</p>
                    </button>
                    {isExpanded && (
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                    )}
                  </div>

                  {/* Status toggle */}
                  <button onClick={() => handleToggleActive(faq.id, faq.isActive)}
                    className={`shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      faq.isActive ? "bg-[#1a8a6e]" : "bg-gray-300"
                    }`}>
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                      faq.isActive ? "translate-x-[18px]" : "translate-x-[3px]"
                    }`} />
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(faq)} className="p-1.5 text-gray-400 hover:text-[#0d4d4d] hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteFaq(faq)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#0a2e2e]">{editFaq ? "Edit FAQ" : "Add New FAQ"}</h2>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{formError}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <input type="text" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required
                  placeholder="e.g. What is the minimum order quantity?"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
                <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required rows={5}
                  placeholder="Provide a detailed answer..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.isActive ? "bg-[#1a8a6e]" : "bg-gray-300"}`}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${form.isActive ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                </button>
                <span className="text-sm text-gray-600">{form.isActive ? "Published" : "Draft (hidden from public)"}</span>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                <button type="submit" disabled={formLoading}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-[#0d4d4d] hover:bg-[#1a8a6e] rounded-lg transition-colors disabled:opacity-50">
                  {formLoading ? "Saving..." : editFaq ? "Save Changes" : "Add FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteFaq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteFaq(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#0a2e2e] mb-1">Delete FAQ</h3>
              <p className="text-sm text-gray-500">This FAQ will be permanently removed.</p>
            </div>
            <div className="p-6 pt-0 flex justify-center gap-3">
              <button onClick={() => setDeleteFaq(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50">
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
