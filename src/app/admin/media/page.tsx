"use client";

import { useState, useEffect, useCallback } from "react";

interface MediaFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size?: number;
    mimetype?: string;
    cacheControl?: string;
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);

  const SUPABASE_URL = "https://bxwsxgcuvpmaczdemhot.supabase.co";
  const BUCKET = "cms-images";

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/media", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to load media files");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong loading media.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      await fetchFiles();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/media?name=${encodeURIComponent(fileName)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setFiles((prev) => prev.filter((f) => f.name !== fileName));
      if (previewFile?.name === fileName) setPreviewFile(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const filtered = files.filter((f) => {
    if (!search) return true;
    return f.name.toLowerCase().includes(search.toLowerCase());
  });

  const totalSize = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2e2e] font-[family-name:var(--font-poppins)]">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">Manage uploaded images and files in Supabase Storage.</p>
        </div>
        <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
          uploading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#0a2e2e] text-white hover:bg-[#0a2e2e]/90"
        }`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {uploading ? "Uploading..." : "Upload File"}
          <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium">Total Files</p>
          <p className="text-2xl font-bold text-[#0a2e2e] mt-1">{files.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium">Total Size</p>
          <p className="text-2xl font-bold text-[#0a2e2e] mt-1">{formatBytes(totalSize)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium">Bucket</p>
          <p className="text-2xl font-bold text-[#0a2e2e] mt-1 text-sm">{BUCKET}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => { setError(null); fetchFiles(); }} className="text-sm font-medium text-red-600 hover:text-red-700 underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
          </svg>
          <p className="text-gray-500 text-sm font-medium">No files found</p>
          <p className="text-gray-400 text-xs mt-1">{search ? "Try a different search term" : "Upload your first file to get started."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((file) => {
            const isImage = file.metadata?.mimetype?.startsWith("image/");
            const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${file.name}`;
            return (
              <div
                key={file.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[var(--color-primary-light)] transition-colors cursor-pointer group"
                onClick={() => setPreviewFile(file)}
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img src={fileUrl} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-[#0a2e2e] truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatBytes(file.metadata?.size || 0)}</p>
                </div>
                <div className="px-3 pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }}
                    className="w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md py-1 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
              {previewFile.metadata?.mimetype?.startsWith("image/") ? (
                <img
                  src={`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${previewFile.name}`}
                  alt={previewFile.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-[#0a2e2e] text-sm truncate">{previewFile.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>{formatBytes(previewFile.metadata?.size || 0)}</span>
                <span>{previewFile.metadata?.mimetype || "Unknown"}</span>
                <span>{new Date(previewFile.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${previewFile.name}`);
                  }}
                  className="flex-1 text-sm font-medium text-[#0a2e2e] border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => handleDelete(previewFile.name)}
                  className="flex-1 text-sm font-medium text-red-600 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
