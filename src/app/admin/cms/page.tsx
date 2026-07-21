"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SECTIONS = ["hero", "about", "products", "news", "contact", "footer"] as const;

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About",
  products: "Products",
  news: "News",
  contact: "Contact",
  footer: "Footer",
};

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const res = await fetch("/api/cms");
      if (res.ok) {
        const records = await res.json();
        const map: Record<string, string> = {};
        for (const r of records) {
          map[r.section] = JSON.stringify(r.content, null, 2);
        }
        for (const s of SECTIONS) {
          if (!map[s]) map[s] = "{}";
        }
        setContent(map);
      }
      setAuthorized(true);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage("");
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(content[activeTab]);
      } catch {
        setMessage("Invalid JSON. Please fix syntax errors.");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: activeTab, content: parsed }),
      });

      if (res.ok) {
        setMessage("Saved successfully!");
      } else {
        const err = await res.json();
        setMessage(err.error || "Failed to save");
      }
    } catch {
      setMessage("Network error");
    }
    setSaving(false);
  }, [activeTab, content]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a2e2e]">
        <div className="text-white text-sm">Loading CMS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0a2e2e] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/messages" className="text-lg font-bold font-[family-name:var(--font-poppins)]">
            Pili AdheSeal
          </Link>
          <span className="text-[#3ecbac] text-sm">CMS Editor</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
            View Site
          </Link>
          <Link href="/admin/messages" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
            Messages
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setActiveTab(s); setMessage(""); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === s
                  ? "bg-[#0d4d4d] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {SECTION_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0a2e2e]">
              {SECTION_LABELS[activeTab]} Content
            </h2>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {message && (
            <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${
              message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {message}
            </div>
          )}

          <p className="text-xs text-gray-400 mb-3">
            Edit the JSON below. Be careful with syntax — invalid JSON will not save.
          </p>

          <textarea
            value={content[activeTab] || "{}"}
            onChange={(e) => setContent((prev) => ({ ...prev, [activeTab]: e.target.value }))}
            className="w-full h-[500px] px-4 py-3 rounded-lg border border-gray-300 font-mono text-sm text-[#0a2e2e] focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none resize-y"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
