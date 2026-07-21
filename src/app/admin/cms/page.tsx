"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type CmsData = Record<string, unknown>;

function Field({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-[#0a2e2e] focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-[#0a2e2e] focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none"
        />
      )}
    </div>
  );
}

function ListField({
  label,
  items,
  onChange,
  fields,
}: {
  label: string;
  items: Record<string, string>[];
  onChange: (items: Record<string, string>[]) => void;
  fields: { key: string; label: string; placeholder?: string; multiline?: boolean }[];
}) {
  function updateItem(index: number, key: string, value: string) {
    const next = items.map((item, i) => (i === index ? { ...item, [key]: value } : item));
    onChange(next);
  }
  function addItem() {
    const empty: Record<string, string> = {};
    fields.forEach((f) => (empty[f.key] = ""));
    onChange([...items, empty]);
  }
  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">#{i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.key} className={f.multiline ? "md:col-span-2" : ""}>
                <Field
                  label={f.label}
                  value={item[f.key] || ""}
                  onChange={(v) => updateItem(i, f.key, v)}
                  multiline={f.multiline}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={addItem} className="text-sm text-[#3ecbac] hover:text-[#0d4d4d] font-medium">
        + Add {label}
      </button>
    </div>
  );
}

function StringListField({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-[#0a2e2e] focus:ring-2 focus:ring-[#3ecbac] focus:border-transparent outline-none"
          />
          <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 px-2">
            ×
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])} className="text-sm text-[#3ecbac] hover:text-[#0d4d4d] font-medium">
        + Add Item
      </button>
    </div>
  );
}

function HeroEditor({ data, onChange }: { data: CmsData; onChange: (d: CmsData) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#0a2e2e] border-b border-gray-200 pb-2">Hero Section</h3>
      <Field label="Badge Text" value={(data.badge as string) || ""} onChange={(v) => set("badge", v)} placeholder="Proudly Filipino-Engineered" />
      <Field label="Heading" value={(data.heading as string) || ""} onChange={(v) => set("heading", v)} placeholder="Pili AdheSeal" />
      <Field label="Highlighted Text" value={(data.highlight as string) || ""} onChange={(v) => set("highlight", v)} placeholder="Sustainable Solutions" />
      <Field label="Subheading" value={(data.subheading as string) || ""} onChange={(v) => set("subheading", v)} multiline placeholder="Main description text..." />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Primary Button Text" value={(data.ctaPrimary as string) || ""} onChange={(v) => set("ctaPrimary", v)} />
        <Field label="Primary Button Link" value={(data.ctaPrimaryLink as string) || ""} onChange={(v) => set("ctaPrimaryLink", v)} />
        <Field label="Secondary Button Text" value={(data.ctaSecondary as string) || ""} onChange={(v) => set("ctaSecondary", v)} />
        <Field label="Secondary Button Link" value={(data.ctaSecondaryLink as string) || ""} onChange={(v) => set("ctaSecondaryLink", v)} />
      </div>
      <StringListField label="Product Tags" items={(data.productTags as string[]) || []} onChange={(v) => set("productTags", v)} />
    </div>
  );
}

function AboutEditor({ data, onChange }: { data: CmsData; onChange: (d: CmsData) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#0a2e2e] border-b border-gray-200 pb-2">About Section</h3>
      <Field label="Section Heading" value={(data.heading as string) || ""} onChange={(v) => set("heading", v)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-[var(--color-accent)] uppercase">Vision</h4>
          <Field label="Title" value={(data.visionTitle as string) || ""} onChange={(v) => set("visionTitle", v)} />
          <Field label="Description" value={(data.visionText as string) || ""} onChange={(v) => set("visionText", v)} multiline />
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-[var(--color-accent)] uppercase">Mission</h4>
          <Field label="Title" value={(data.missionTitle as string) || ""} onChange={(v) => set("missionTitle", v)} />
          <Field label="Description" value={(data.missionText as string) || ""} onChange={(v) => set("missionText", v)} multiline />
        </div>
      </div>
    </div>
  );
}

function ProductsEditor({ data, onChange }: { data: CmsData; onChange: (d: CmsData) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  const items = ((data.items as Record<string, string>[]) || []).map((item) => ({ ...item }));
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#0a2e2e] border-b border-gray-200 pb-2">Products Section</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Badge" value={(data.sectionBadge as string) || ""} onChange={(v) => set("sectionBadge", v)} />
        <Field label="Heading" value={(data.sectionHeading as string) || ""} onChange={(v) => set("sectionHeading", v)} />
        <Field label="Subheading" value={(data.sectionSubheading as string) || ""} onChange={(v) => set("sectionSubheading", v)} />
      </div>
      <ListField
        label="Products"
        items={items}
        onChange={(v) => set("items", v)}
        fields={[
          { key: "name", label: "Product Name", placeholder: "Pili Adhesive" },
          { key: "tagline", label: "Tagline", placeholder: "Engineered for Stronger Bonds." },
          { key: "description", label: "Description", multiline: true },
          { key: "image", label: "Image Path", placeholder: "/products/pili-adhesive.svg" },
        ]}
      />
    </div>
  );
}

function NewsEditor({ data, onChange }: { data: CmsData; onChange: (d: CmsData) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  const items = ((data.items as Record<string, string>[]) || []).map((item) => ({ ...item }));
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#0a2e2e] border-b border-gray-200 pb-2">News Section</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Section Heading" value={(data.heading as string) || ""} onChange={(v) => set("heading", v)} />
        <Field label="Section Subheading" value={(data.subheading as string) || ""} onChange={(v) => set("subheading", v)} />
      </div>
      <ListField
        label="News Items"
        items={items}
        onChange={(v) => set("items", v)}
        fields={[
          { key: "title", label: "Title", placeholder: "Article title" },
          { key: "url", label: "URL", placeholder: "https://..." },
          { key: "description", label: "Description", multiline: true },
        ]}
      />
    </div>
  );
}

function ContactEditor({ data, onChange }: { data: CmsData; onChange: (d: CmsData) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#0a2e2e] border-b border-gray-200 pb-2">Contact Section</h3>
      <Field label="Section Heading" value={(data.heading as string) || ""} onChange={(v) => set("heading", v)} />
      <Field label="Section Subheading" value={(data.subheading as string) || ""} onChange={(v) => set("subheading", v)} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="LinkedIn URL" value={(data.linkedin as string) || ""} onChange={(v) => set("linkedin", v)} placeholder="https://linkedin.com/..." />
        <Field label="Facebook URL" value={(data.facebook as string) || ""} onChange={(v) => set("facebook", v)} placeholder="https://facebook.com/..." />
        <Field label="Instagram URL" value={(data.instagram as string) || ""} onChange={(v) => set("instagram", v)} placeholder="https://instagram.com/..." />
      </div>
    </div>
  );
}

function FooterEditor({ data, onChange }: { data: CmsData; onChange: (d: CmsData) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#0a2e2e] border-b border-gray-200 pb-2">Footer Section</h3>
      <Field label="Brand Description" value={(data.description as string) || ""} onChange={(v) => set("description", v)} multiline />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="LinkedIn URL" value={(data.linkedin as string) || ""} onChange={(v) => set("linkedin", v)} />
        <Field label="Facebook URL" value={(data.facebook as string) || ""} onChange={(v) => set("facebook", v)} />
        <Field label="Instagram URL" value={(data.instagram as string) || ""} onChange={(v) => set("instagram", v)} />
      </div>
      <StringListField label="Product Names" items={(data.products as string[]) || []} onChange={(v) => set("products", v)} />
      <ListField
        label="Quick Links"
        items={((data.quickLinks as Record<string, string>[]) || []).map((l) => ({ ...l }))}
        onChange={(v) => set("quickLinks", v)}
        fields={[
          { key: "label", label: "Label", placeholder: "About Us" },
          { key: "href", label: "Link", placeholder: "#about" },
        ]}
      />
    </div>
  );
}

const SECTION_EDITORS: Record<string, React.ComponentType<{ data: CmsData; onChange: (d: CmsData) => void }>> = {
  hero: HeroEditor,
  about: AboutEditor,
  products: ProductsEditor,
  news: NewsEditor,
  contact: ContactEditor,
  footer: FooterEditor,
};

const SECTIONS = ["hero", "about", "products", "news", "contact", "footer"] as const;
const SECTION_LABELS: Record<string, string> = {
  hero: "Hero", about: "About", products: "Products", news: "News", contact: "Contact", footer: "Footer",
};

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [content, setContent] = useState<Record<string, CmsData>>({});
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
        const map: Record<string, CmsData> = {};
        for (const r of records) map[r.section] = r.content;
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
      const res = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: activeTab, content: content[activeTab] }),
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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Loading CMS...</div>
      </div>
    );
  }

  const Editor = SECTION_EDITORS[activeTab];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
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
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {Editor && <Editor data={content[activeTab] || {}} onChange={(d) => setContent((prev) => ({ ...prev, [activeTab]: d }))} />}
      </div>
    </div>
  );
}
