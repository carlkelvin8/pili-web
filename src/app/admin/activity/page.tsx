"use client";

import { useState, useEffect, useCallback } from "react";

interface ActivityEntry {
  id: string;
  action: string;
  details: string | null;
  adminEmail: string;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function actionIcon(action: string) {
  if (action === "quick_reply_created") return { color: "bg-green-500", letter: "Q" };
  if (action === "quick_reply_deleted") return { color: "bg-red-500", letter: "Q" };
  if (action === "cms_updated") return { color: "bg-blue-500", letter: "C" };
  if (action.includes("message")) return { color: "bg-purple-500", letter: "M" };
  return { color: "bg-gray-500", letter: "A" };
}

function formatAction(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("action", filter);
      const res = await fetch(`/api/activity-log?${params.toString()}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to load activity log");
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong loading activity.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const actions = [
    { value: "all", label: "All" },
    { value: "quick_reply_created", label: "Quick Replies" },
    { value: "cms_updated", label: "CMS Updates" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0a2e2e] font-[family-name:var(--font-poppins)]">Activity Log</h1>
        <p className="text-sm text-gray-500 mt-1">Track all admin actions across the dashboard.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {actions.map((a) => (
          <button
            key={a.value}
            onClick={() => setFilter(a.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === a.value
                ? "bg-[#0a2e2e] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={fetchActivities} className="text-sm font-medium text-red-600 hover:text-red-700 underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-2 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-sm font-medium">No activity recorded yet</p>
          <p className="text-gray-400 text-xs mt-1">Actions like creating quick replies or updating CMS content will appear here.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-200" />
          <div className="space-y-1">
            {activities.map((activity) => {
              const icon = actionIcon(activity.action);
              return (
                <div key={activity.id} className="relative flex items-start gap-4 py-3 px-1 group">
                  <div className={`w-9 h-9 rounded-full ${icon.color} flex items-center justify-center text-white text-xs font-bold shrink-0 z-10`}>
                    {icon.letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#0a2e2e]">{formatAction(activity.action)}</span>
                      <span className="text-xs text-gray-400">{timeAgo(activity.createdAt)}</span>
                    </div>
                    {activity.details && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.details}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-0.5">by {activity.adminEmail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
