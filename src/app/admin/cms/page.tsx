"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type CmsData = Record<string, unknown>;
type ContentStatus = "DRAFT" | "PUBLISHED";

interface SectionState {
  content: CmsData;
  status: ContentStatus;
  publishedAt: string | null;
}

function validateSection(section: string, data: CmsData): string {
  switch (section) {
    case "hero":
      if (!data.heading || !(data.heading as string).trim()) return "Hero heading is required.";
      if (!data.subheading || !(data.subheading as string).trim()) return "Hero subheading is required.";
      break;
    case "about":
      if (!data.heading || !(data.heading as string).trim()) return "Section heading is required.";
      if (!data.visionText || !(data.visionText as string).trim()) return "Vision description is required.";
      if (!data.missionText || !(data.missionText as string).trim()) return "Mission description is required.";
      break;
    case "products": {
      if (!data.sectionHeading || !(data.sectionHeading as string).trim()) return "Section heading is required.";
      const items = data.items as Record<string, string>[] | undefined;
      if (!items || items.length === 0) return "Add at least one product.";
      for (let i = 0; i < items.length; i++) {
        if (!items[i].name?.trim()) return `Product #${i + 1}: name is required.`;
        if (!items[i].tagline?.trim()) return `Product #${i + 1}: tagline is required.`;
      }
      break;
    }
    case "news": {
      const items = data.items as Record<string, string>[] | undefined;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (!items[i].title?.trim()) return `News #${i + 1}: title is required.`;
          if (!items[i].url?.trim()) return `News #${i + 1}: URL is required.`;
          if (items[i].url && !items[i].url.startsWith("http")) return `News #${i + 1}: URL must start with http://`;
        }
      }
      break;
    }
    case "contact":
      if (data.linkedin && !(data.linkedin as string).startsWith("http")) return "LinkedIn URL must start with http://";
      if (data.facebook && !(data.facebook as string).startsWith("http")) return "Facebook URL must start with http://";
      if (data.instagram && !(data.instagram as string).startsWith("http")) return "Instagram URL must start with http://";
      break;
    case "footer": {
      const links = data.quickLinks as Record<string, string>[] | undefined;
      if (links) {
        for (let i = 0; i < links.length; i++) {
          if (!links[i].label?.trim()) return `Quick link #${i + 1}: label is required.`;
          if (!links[i].href?.trim()) return `Quick link #${i + 1}: link is required.`;
        }
      }
      break;
    }
  }
  return "";
}

const SECTIONS_META: Record<string, { label: string; icon: string; description: string }> = {
  hero: { label: "Hero", icon: "🏠", description: "Main banner section with headline and call-to-action" },
  about: { label: "About", icon: "ℹ️", description: "Company vision and mission statements" },
  products: { label: "Products", icon: "📦", description: "Product listings with images and descriptions" },
  news: { label: "News", icon: "📰", description: "Featured articles, press, and media links" },
  contact: { label: "Contact", icon: "📞", description: "Social media links and contact info" },
  footer: { label: "Footer", icon: "🔗", description: "Footer branding, links, and social icons" },
};

const SECTIONS = ["hero", "about", "products", "news", "contact", "footer"] as const;

/* ─── Field Components ─── */

function InputField({
  label, value, onChange, hint, placeholder, icon, required,
}: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; placeholder?: string; icon?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {icon && <span>{icon}</span>}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-[#0a2e2e] focus:ring-2 focus:ring-[#3ecbac]/50 focus:border-[#3ecbac] focus:bg-white outline-none transition-all placeholder:text-gray-400"
      />
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function TextareaField({
  label, value, onChange, hint, placeholder, rows = 3, required,
}: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; placeholder?: string; rows?: number; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <span className="text-[10px] text-gray-400">{value.length} chars</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-[#0a2e2e] focus:ring-2 focus:ring-[#3ecbac]/50 focus:border-[#3ecbac] focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400"
      />
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (!src) return null;
  return (
    <div className="relative w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden shrink-0">
      {!error ? (
        <img src={src} alt={alt} className="w-full h-full object-contain p-1" onError={() => setError(true)} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
      )}
    </div>
  );
}

function ImageUploadField({
  value, onChange, label, folder,
}: {
  value: string; onChange: (v: string) => void; label: string; folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    if (folder) fd.append("folder", folder);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      } else {
        const err = await res.json();
        setError(err.error || "Upload failed. Please try again.");
      }
    } catch {
      setError("Unable to upload. Please check your connection.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">📷 {label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden shrink-0 group">
            <img src={value} alt="" className="w-full h-full object-contain p-1" />
            <button
              onClick={() => { onChange(""); setError(""); }}
              className="absolute top-0.5 right-0.5 bg-white/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center shrink-0">
            {uploading ? (
              <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : (
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" /></svg>
            )}
          </div>
        )}
        <div className="flex-1 space-y-1">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-sm font-medium text-[#0d4d4d] hover:text-[#1a8a6e] border border-gray-200 hover:border-[#3ecbac] px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
          >
            {uploading ? "Uploading..." : value ? "Replace Image" : "Choose Image"}
          </button>
          <p className="text-[10px] text-gray-400">PNG, JPG, WebP, SVG — max 5 MB</p>
          {error && <p className="text-[11px] text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function DragHandle() {
  return (
    <svg className="w-4 h-4 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
      <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
    </svg>
  );
}

/* ─── Section Editors ─── */

function HeroEditor({ data, onChange }: { data: CmsData; onChange: (d: CmsData) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  const tags = (data.productTags as string[]) || [];
  return (
    <div className="space-y-6">
      <Card title="Main Content" description="Your primary headline and description">
        <InputField label="Badge Text" value={(data.badge as string) || ""} onChange={(v) => set("badge", v)} icon="🏷️" placeholder="Proudly Filipino-Engineered" />
        <InputField label="Heading" value={(data.heading as string) || ""} onChange={(v) => set("heading", v)} icon="✨" required placeholder="Pili AdheSeal" />
        <InputField label="Highlighted Text" value={(data.highlight as string) || ""} onChange={(v) => set("highlight", v)} icon="💡" placeholder="Sustainable Solutions" hint="This text appears with gradient styling" />
        <TextareaField label="Subheading" value={(data.subheading as string) || ""} onChange={(v) => set("subheading", v)} required placeholder="Your main description..." rows={3} hint="Appears below the heading" />
      </Card>
      <Card title="Call-to-Action Buttons" description="Configure the main action buttons">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-xs font-bold text-[var(--color-accent)]">Primary Button</p>
            <InputField label="Button Text" value={(data.ctaPrimary as string) || ""} onChange={(v) => set("ctaPrimary", v)} placeholder="View Our Products" />
            <InputField label="Button Link" value={(data.ctaPrimaryLink as string) || ""} onChange={(v) => set("ctaPrimaryLink", v)} placeholder="#products" />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400">Secondary Button</p>
            <InputField label="Button Text" value={(data.ctaSecondary as string) || ""} onChange={(v) => set("ctaSecondary", v)} placeholder="Get in Touch" />
            <InputField label="Button Link" value={(data.ctaSecondaryLink as string) || ""} onChange={(v) => set("ctaSecondaryLink", v)} placeholder="#contact" />
          </div>
        </div>
      </Card>
      <Card title="Product Tags" description="Tags displayed at the bottom of the hero section">
        <div className="space-y-2">
          {tags.map((tag, i) => (
            <div key={i} className="flex items-center gap-2">
              <DragHandle />
              <input
                type="text"
                value={tag}
                onChange={(e) => { const next = [...tags]; next[i] = e.target.value; set("productTags", next); }}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 text-sm focus:ring-2 focus:ring-[#3ecbac]/50 focus:border-[#3ecbac] focus:bg-white outline-none transition-all"
              />
              <button onClick={() => set("productTags", tags.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
          <button onClick={() => set("productTags", [...tags, ""])} className="text-sm text-[#3ecbac] hover:text-[#0d4d4d] font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Tag
          </button>
        </div>
      </Card>
    </div>
  );
}

function AboutEditor({ data, onChange }: { data: CmsData; onChange: (d: CmsData) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-6">
      <Card title="Section Header" description="The main heading for the about section">
        <InputField label="Section Heading" value={(data.heading as string) || ""} onChange={(v) => set("heading", v)} required placeholder="About Pili AdheSeal Inc." />
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="👁️ Vision" description="Your company's vision statement" accent="green">
          <InputField label="Title" value={(data.visionTitle as string) || ""} onChange={(v) => set("visionTitle", v)} placeholder="Our Vision" />
          <TextareaField label="Description" value={(data.visionText as string) || ""} onChange={(v) => set("visionText", v)} required placeholder="Your vision statement..." rows={4} />
        </Card>
        <Card title="🎯 Mission" description="Your company's mission statement" accent="blue">
          <InputField label="Title" value={(data.missionTitle as string) || ""} onChange={(v) => set("missionTitle", v)} placeholder="Our Mission" />
          <TextareaField label="Description" value={(data.missionText as string) || ""} onChange={(v) => set("missionText", v)} required placeholder="Your mission statement..." rows={4} />
        </Card>
      </div>
    </div>
  );
}

function ProductsEditor({ data, onChange }: { data: CmsData; onChange: (d: CmsData) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  const items = ((data.items as Record<string, string>[]) || []).map((item) => ({ ...item }));

  function moveItem(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set("items", next);
  }

  return (
    <div className="space-y-6">
      <Card title="Section Header" description="Heading for the products section">
        <div className="grid grid-cols-3 gap-4">
          <InputField label="Badge" value={(data.sectionBadge as string) || ""} onChange={(v) => set("sectionBadge", v)} placeholder="Our Products" />
          <InputField label="Heading" value={(data.sectionHeading as string) || ""} onChange={(v) => set("sectionHeading", v)} required placeholder="Engineered for Performance" />
          <InputField label="Subheading" value={(data.sectionSubheading as string) || ""} onChange={(v) => set("sectionSubheading", v)} placeholder="Five core product lines..." />
        </div>
      </Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700">Products ({items.length})</h3>
          <button onClick={() => set("items", [...items, { name: "", tagline: "", description: "", image: "" }])} className="text-sm text-[#3ecbac] hover:text-[#0d4d4d] font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Product
          </button>
        </div>
        {items.map((product, i) => (
          <Card key={i} title={`#${i + 1}`} description={product.name || "Untitled product"} compact>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 pt-6">
                <DragHandle />
                <button onClick={() => moveItem(i, i - 1)} disabled={i === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg></button>
                <button onClick={() => moveItem(i, i + 1)} disabled={i === items.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></button>
              </div>
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Product Name" value={product.name || ""} onChange={(v) => { const next = [...items]; next[i] = { ...next[i], name: v }; set("items", next); }} required placeholder="Pili Adhesive" />
                  <InputField label="Tagline" value={product.tagline || ""} onChange={(v) => { const next = [...items]; next[i] = { ...next[i], tagline: v }; set("items", next); }} required placeholder="Engineered for Stronger Bonds." />
                </div>
                <TextareaField label="Description" value={product.description || ""} onChange={(v) => { const next = [...items]; next[i] = { ...next[i], description: v }; set("items", next); }} placeholder="Product description..." rows={2} />
                <ImageUploadField
                  value={product.image || ""}
                  onChange={(v) => { const next = [...items]; next[i] = { ...next[i], image: v }; set("items", next); }}
                  label="Product Image"
                  folder={`products/${i}`}
                />
              </div>
              <button onClick={() => set("items", items.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 p-2 transition-colors mt-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NewsEditor({ data, onChange }: { data: CmsData; onChange: (d: CmsData) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  const items = ((data.items as Record<string, string>[]) || []).map((item) => ({ ...item }));

  function moveItem(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set("items", next);
  }

  return (
    <div className="space-y-6">
      <Card title="Section Header" description="Heading for the news section">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Heading" value={(data.heading as string) || ""} onChange={(v) => set("heading", v)} placeholder="News" />
          <InputField label="Subheading" value={(data.subheading as string) || ""} onChange={(v) => set("subheading", v)} placeholder="Stay updated with our latest..." />
        </div>
      </Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700">News Items ({items.length})</h3>
          <button onClick={() => set("items", [...items, { title: "", url: "", description: "" }])} className="text-sm text-[#3ecbac] hover:text-[#0d4d4d] font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add News Item
          </button>
        </div>
        {items.map((item, i) => (
          <Card key={i} title={`#${i + 1}`} description={item.title || "Untitled"} compact>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 pt-6">
                <DragHandle />
                <button onClick={() => moveItem(i, i - 1)} disabled={i === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg></button>
                <button onClick={() => moveItem(i, i + 1)} disabled={i === items.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></button>
              </div>
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Title" value={item.title || ""} onChange={(v) => { const next = [...items]; next[i] = { ...next[i], title: v }; set("items", next); }} required placeholder="Article title" />
                  <InputField label="URL" value={item.url || ""} onChange={(v) => { const next = [...items]; next[i] = { ...next[i], url: v }; set("items", next); }} required placeholder="https://..." hint="Must start with http://" />
                </div>
                <TextareaField label="Description" value={item.description || ""} onChange={(v) => { const next = [...items]; next[i] = { ...next[i], description: v }; set("items", next); }} placeholder="Brief description..." rows={2} />
              </div>
              <button onClick={() => set("items", items.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 p-2 transition-colors mt-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ContactEditor({ data, onChange }: { data: CmsData; onChange: (d: CmsData) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-6">
      <Card title="Section Header" description="Heading for the contact section">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Heading" value={(data.heading as string) || ""} onChange={(v) => set("heading", v)} placeholder="Contact Us" />
          <InputField label="Subheading" value={(data.subheading as string) || ""} onChange={(v) => set("subheading", v)} placeholder="Connect with us..." />
        </div>
      </Card>
      <Card title="Social Media Links" description="Links displayed in the contact section">
        <div className="space-y-4">
          {[
            { key: "linkedin", label: "LinkedIn", color: "#0077b5", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
            { key: "facebook", label: "Facebook", color: "#1877f2", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
            { key: "instagram", label: "Instagram", color: "#e4405f", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg> },
          ].map((s) => (
            <div key={s.key} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <div className="flex-1">
                <InputField label={s.label} value={(data[s.key] as string) || ""} onChange={(v) => set(s.key, v)} placeholder={`https://${s.key}.com/...`} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function FooterEditor({ data, onChange }: { data: CmsData; onChange: (d: CmsData) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  const products = (data.products as string[]) || [];
  const links = ((data.quickLinks as Record<string, string>[]) || []).map((l) => ({ ...l }));
  return (
    <div className="space-y-6">
      <Card title="Brand" description="Footer branding and social links">
        <TextareaField label="Brand Description" value={(data.description as string) || ""} onChange={(v) => set("description", v)} placeholder="High-performance sealants..." rows={2} />
        <div className="grid grid-cols-3 gap-3">
          <InputField label="LinkedIn" value={(data.linkedin as string) || ""} onChange={(v) => set("linkedin", v)} placeholder="https://linkedin.com/..." />
          <InputField label="Facebook" value={(data.facebook as string) || ""} onChange={(v) => set("facebook", v)} placeholder="https://facebook.com/..." />
          <InputField label="Instagram" value={(data.instagram as string) || ""} onChange={(v) => set("instagram", v)} placeholder="https://instagram.com/..." />
        </div>
      </Card>
      <Card title="Product Names" description="Products listed in the footer">
        <div className="space-y-2">
          {products.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <DragHandle />
              <input type="text" value={p} onChange={(e) => { const next = [...products]; next[i] = e.target.value; set("products", next); }} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 text-sm focus:ring-2 focus:ring-[#3ecbac]/50 focus:border-[#3ecbac] focus:bg-white outline-none transition-all" />
              <button onClick={() => set("products", products.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          ))}
          <button onClick={() => set("products", [...products, ""])} className="text-sm text-[#3ecbac] hover:text-[#0d4d4d] font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> Add Product</button>
        </div>
      </Card>
      <Card title="Quick Links" description="Navigation links in the footer">
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <DragHandle />
              <input type="text" value={link.label || ""} onChange={(e) => { const next = [...links]; next[i] = { ...next[i], label: e.target.value }; set("quickLinks", next); }} placeholder="Label" className="w-1/3 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 text-sm focus:ring-2 focus:ring-[#3ecbac]/50 focus:border-[#3ecbac] focus:bg-white outline-none transition-all" />
              <input type="text" value={link.href || ""} onChange={(e) => { const next = [...links]; next[i] = { ...next[i], href: e.target.value }; set("quickLinks", next); }} placeholder="#about" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 text-sm focus:ring-2 focus:ring-[#3ecbac]/50 focus:border-[#3ecbac] focus:bg-white outline-none transition-all" />
              <button onClick={() => set("quickLinks", links.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          ))}
          <button onClick={() => set("quickLinks", [...links, { label: "", href: "" }])} className="text-sm text-[#3ecbac] hover:text-[#0d4d4d] font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> Add Link</button>
        </div>
      </Card>
    </div>
  );
}

/* ─── Card Component ─── */

function Card({ title, description, children, compact, accent }: {
  title: string; description?: string; children: React.ReactNode; compact?: boolean; accent?: string;
}) {
  const borderColor = accent === "green" ? "border-l-green-400" : accent === "blue" ? "border-l-blue-400" : "";
  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${borderColor ? `border-l-4 ${borderColor}` : ""} shadow-sm overflow-hidden`}>
      <div className={`${compact ? "px-4 py-2.5" : "px-5 py-4"} border-b border-gray-100 bg-gray-50/50`}>
        <h3 className={`font-bold text-[#0a2e2e] ${compact ? "text-xs" : "text-sm"}`}>{title}</h3>
        {description && <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className={`${compact ? "p-4" : "p-5"} space-y-4`}>{children}</div>
    </div>
  );
}

/* ─── Section Editors Map ─── */

const SECTION_EDITORS: Record<string, React.ComponentType<{ data: CmsData; onChange: (d: CmsData) => void }>> = {
  hero: HeroEditor, about: AboutEditor, products: ProductsEditor, news: NewsEditor, contact: ContactEditor, footer: FooterEditor,
};

/* ─── Main CMS Page ─── */

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [content, setContent] = useState<Record<string, CmsData>>({});
  const [savedContent, setSavedContent] = useState<Record<string, CmsData>>({});
  const [sectionStates, setSectionStates] = useState<Record<string, SectionState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Changes saved successfully!");
  const [previewMode, setPreviewMode] = useState(false);
  const [togglingPreview, setTogglingPreview] = useState(false);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      // Fetch ALL sections including drafts for the admin
      const res = await fetch("/api/cms?preview=true");
      if (res.ok) {
        const records = await res.json();
        const map: Record<string, CmsData> = {};
        const states: Record<string, SectionState> = {};
        for (const r of records) {
          map[r.section] = r.content;
          states[r.section] = { content: r.content, status: r.status ?? "DRAFT", publishedAt: r.publishedAt ?? null };
        }
        setContent(map);
        setSavedContent(JSON.parse(JSON.stringify(map)));
        setSectionStates(states);
      }
      setAuthorized(true);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const isDirty = JSON.stringify(content) !== JSON.stringify(savedContent);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (isDirty) e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const showToast = useCallback((msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessToast(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowSuccessToast(false), 3000);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage("");
    const d = content[activeTab] || {};
    const validationError = validateSection(activeTab, d);
    if (validationError) {
      setMessage(validationError);
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: activeTab, content: d }),
      });
      if (res.ok) {
        const saved = await res.json();
        setSavedContent((prev) => ({ ...prev, [activeTab]: JSON.parse(JSON.stringify(d)) }));
        setSectionStates((prev) => ({
          ...prev,
          [activeTab]: { content: d, status: saved.status ?? "DRAFT", publishedAt: saved.publishedAt ?? null },
        }));
        setLastSaved(new Date());
        showToast("Draft saved successfully!");
        setMessage("");
      } else {
        const err = await res.json();
        setMessage(err.error || "We couldn't save your changes. Please try again.");
      }
    } catch {
      setMessage("Unable to connect. Please check your internet and try again.");
    }
    setSaving(false);
  }, [activeTab, content, showToast]);

  const handlePublish = useCallback(async (action: "publish" | "unpublish") => {
    // Save first if there are unsaved changes
    const sectionDirty = JSON.stringify(content[activeTab]) !== JSON.stringify(savedContent[activeTab]);
    if (sectionDirty && action === "publish") {
      const d = content[activeTab] || {};
      const validationError = validateSection(activeTab, d);
      if (validationError) {
        setMessage(validationError);
        return;
      }
      // Save draft first
      setSaving(true);
      try {
        const saveRes = await fetch("/api/cms", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: activeTab, content: d }),
        });
        if (!saveRes.ok) {
          const err = await saveRes.json();
          setMessage(err.error || "Couldn't save before publishing. Please try again.");
          setSaving(false);
          return;
        }
        setSavedContent((prev) => ({ ...prev, [activeTab]: JSON.parse(JSON.stringify(d)) }));
      } catch {
        setMessage("Unable to connect. Please check your internet and try again.");
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    setPublishing(true);
    setMessage("");
    try {
      const res = await fetch("/api/cms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: activeTab, action }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSectionStates((prev) => ({
          ...prev,
          [activeTab]: { ...prev[activeTab], status: updated.status, publishedAt: updated.publishedAt ?? null },
        }));
        showToast(action === "publish" ? "Section published to live site!" : "Section unpublished — now in draft.");
      } else {
        const err = await res.json();
        setMessage(err.error || "Couldn't update publish status. Please try again.");
      }
    } catch {
      setMessage("Unable to connect. Please check your internet and try again.");
    }
    setPublishing(false);
  }, [activeTab, content, savedContent, showToast]);

  const handleTogglePreview = useCallback(async () => {
    setTogglingPreview(true);
    try {
      const next = !previewMode;
      const res = await fetch("/api/cms/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enable: next }),
      });
      if (res.ok) {
        setPreviewMode(next);
        // Open preview in new tab
        if (next) {
          window.open("/", "_blank");
        }
        showToast(next ? "Preview mode ON — site now shows drafts." : "Preview mode OFF.");
      }
    } catch {
      // silently fail
    }
    setTogglingPreview(false);
  }, [previewMode, showToast]);

  if (loading || !authorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Loading CMS...
        </div>
      </div>
    );
  }

  const Editor = SECTION_EDITORS[activeTab];
  const meta = SECTIONS_META[activeTab];
  const sectionDirty = JSON.stringify(content[activeTab]) !== JSON.stringify(savedContent[activeTab]);
  const currentStatus: ContentStatus = sectionStates[activeTab]?.status ?? "DRAFT";
  const publishedAt = sectionStates[activeTab]?.publishedAt;

  return (
    <div className="flex h-[calc(100vh-49px)]">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Preview Mode Banner */}
      {previewMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-xs font-semibold text-center py-1.5 flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Preview Mode Active — drafts are visible on the live site
          <button onClick={handleTogglePreview} className="ml-3 underline hover:no-underline">Exit Preview</button>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-bold text-[#0a2e2e]">Page Sections</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Click a section to edit its content</p>
        </div>
        <div className="p-3 space-y-1.5">
          {SECTIONS.map((s) => {
            const m = SECTIONS_META[s];
            const isActive = activeTab === s;
            const dirty = JSON.stringify(content[s]) !== JSON.stringify(savedContent[s]);
            const status: ContentStatus = sectionStates[s]?.status ?? "DRAFT";
            return (
              <button
                key={s}
                onClick={() => setActiveTab(s)}
                className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#0d4d4d] text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${isActive ? "text-white" : "text-[#0a2e2e]"}`}>{m.label}</span>
                      {dirty && <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" title="Unsaved changes" />}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] truncate ${isActive ? "text-white/60" : "text-gray-400"}`}>{m.description}</span>
                    </div>
                    <div className="mt-1">
                      {status === "PUBLISHED" ? (
                        <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${isActive ? "bg-green-500/30 text-green-200" : "bg-green-100 text-green-700"}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                          Published
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white/70" : "bg-gray-100 text-gray-500"}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-bold text-[#0a2e2e] flex items-center gap-2">
              <span>{meta.icon}</span>
              {meta.label}
              {sectionDirty && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Unsaved</span>}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-400">{meta.description}</p>
              {publishedAt && currentStatus === "PUBLISHED" && (
                <span className="text-[10px] text-gray-400">
                  · Published {new Date(publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-[11px] text-gray-400">
                Saved {lastSaved.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            )}

            {/* Preview Mode Toggle */}
            <button
              onClick={handleTogglePreview}
              disabled={togglingPreview}
              title={previewMode ? "Exit preview mode" : "Enter preview mode — see all drafts on site"}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                previewMode
                  ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                  : "border-gray-200 text-gray-500 hover:text-[#3ecbac] hover:border-[#3ecbac]"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {previewMode ? "Exit Preview" : "Preview"}
            </button>

            {/* Save Draft Button */}
            <button
              onClick={handleSave}
              disabled={saving || !sectionDirty}
              className="border border-gray-200 text-gray-600 hover:text-[#0d4d4d] hover:border-gray-300 px-4 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Saving...</>
              ) : "Save Draft"}
            </button>

            {/* Publish / Unpublish Button */}
            {currentStatus === "PUBLISHED" ? (
              <button
                onClick={() => handlePublish("unpublish")}
                disabled={publishing}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {publishing ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Unpublishing...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg> Unpublish</>
                )}
              </button>
            ) : (
              <button
                onClick={() => handlePublish("publish")}
                disabled={publishing || saving}
                className="bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {publishing ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Publishing...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg> Publish</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {message && (
          <div className="mx-6 mt-4 flex items-start gap-3 bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-200">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            <div><p className="font-medium">Please fix the following:</p><p className="mt-0.5">{message}</p></div>
          </div>
        )}

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {Editor && <Editor data={content[activeTab] || {}} onChange={(d) => setContent((prev) => ({ ...prev, [activeTab]: d }))} />}
        </div>
      </div>
    </div>
  );
}
