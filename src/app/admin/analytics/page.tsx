"use client";

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const AnalyticsCharts = lazy(() => import("@/components/admin/AnalyticsCharts"));

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  totalCustomers: number;
  unreadMessages: number;
  statusBreakdown: Record<string, number>;
  monthlyInquiries: { month: string; inquiries: number; messages: number }[];
  responseRate: number;
  avgMessagesPerConv: number;
  conversationsThisMonth: number;
  conversationsLastMonth: number;
  conversationsTrend: number;
  messagesThisMonth: number;
  messagesLastMonth: number;
  messagesTrend: number;
  newCustomersThisMonth: number;
  newCustomersLastMonth: number;
  customersTrend: number;
  unreadTrend: number;
  dailyMessages: { date: string; count: number }[];
  dayOfWeekData: { day: string; messages: number }[];
  hourlyData: { hour: string; messages: number }[];
  topCustomers: { name: string; email: string; count: number }[];
  recentActivity: {
    id: string; content: string; createdAt: string; sender: string;
    role: string; conversationSubject: string; conversationId: string;
  }[];
  conversionRate: number;
  peakHour: string;
  avgResponseTimeMinutes: number;
  responseTimeFormatted: string;
}

function TrendBadge({ value, invert }: { value: number; invert?: boolean }) {
  const positive = invert ? value < 0 : value > 0;
  const neutral = value === 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
      neutral ? "bg-gray-100 text-gray-500" : positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
    }`}>
      {!neutral && (
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d={positive ? "M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" : "M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"} />
        </svg>
      )}
      {neutral ? "0" : `${Math.abs(value)}%`}
    </span>
  );
}

function StatCard({ label, value, icon, trend, trendInvert, accent }: {
  label: string; value: string | number; icon: string;
  trend?: number; trendInvert?: boolean; accent?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden ${accent || ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-[#0a2e2e]">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {trend !== undefined && (
        <div className="mt-2">
          <TrendBadge value={trend} invert={trendInvert} />
          <span className="text-[10px] text-gray-400 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
}

function exportCSV(data: AnalyticsData) {
  const rows: string[] = [];
  rows.push("Metric,Value");
  rows.push(`Total Conversations,${data.totalConversations}`);
  rows.push(`Total Messages,${data.totalMessages}`);
  rows.push(`Total Customers,${data.totalCustomers}`);
  rows.push(`Unread Messages,${data.unreadMessages}`);
  rows.push(`Response Rate,${data.responseRate}%`);
  rows.push(`Avg Response Time,${data.responseTimeFormatted}`);
  rows.push(`Avg Messages/Conv,${data.avgMessagesPerConv}`);
  rows.push(`Conversion Rate,${data.conversionRate}%`);
  rows.push(`Peak Hour,${data.peakHour}`);
  rows.push("");
  rows.push("Date,Messages");
  for (const d of data.dailyMessages) {
    rows.push(`${d.date},${d.count}`);
  }
  rows.push("");
  rows.push("Day,Messages");
  for (const d of data.dayOfWeekData) {
    rows.push(`${d.day},${d.messages}`);
  }
  rows.push("");
  rows.push("Hour,Messages");
  for (const d of data.hourlyData) {
    rows.push(`${d.hour},${d.messages}`);
  }
  rows.push("");
  rows.push("Customer,Email,Messages");
  for (const c of data.topCustomers) {
    rows.push(`"${c.name}",${c.email},${c.count}`);
  }

  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pili-analytics-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<"12m" | "6m" | "3m">("12m");
  const [dateMode, setDateMode] = useState<"preset" | "custom">("preset");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  const fetchAnalytics = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      let url = "/api/analytics";
      if (dateMode === "custom" && startDate && endDate) {
        url += `?start=${startDate}&end=${endDate}`;
      }
      const res = await fetch(url, { credentials: "same-origin" });
      if (res.ok) {
        const analytics = await res.json();
        setData(analytics);
      } else {
        setError("We couldn't load your analytics data. Please try refreshing the page.");
      }
    } catch {
      setError("Unable to load analytics. Please check your internet connection and try again.");
    }
    setLoading(false);
  }, [router, dateMode, startDate, endDate]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const handleExport = () => {
    if (!data) return;
    setExporting(true);
    exportCSV(data);
    setTimeout(() => setExporting(false), 1000);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="flex items-start gap-3 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 border border-red-200">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div>
            <p className="font-medium">Something went wrong</p>
            <p className="mt-1">{error || "We couldn't load the analytics data. Please try again later."}</p>
            <button onClick={fetchAnalytics} className="mt-2 text-sm text-[#3ecbac] hover:text-[#0d4d4d] font-medium">Try again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2e2e] font-[family-name:var(--font-poppins)]">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive overview of your site activity</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setDateMode("preset")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${dateMode === "preset" ? "bg-white text-[#0a2e2e] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Preset
            </button>
            <button onClick={() => setDateMode("custom")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${dateMode === "custom" ? "bg-white text-[#0a2e2e] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Custom
            </button>
          </div>

          {dateMode === "preset" ? (
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {([["3m", "3M"], ["6m", "6M"], ["12m", "12M"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setPeriod(key)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${period === key ? "bg-white text-[#0a2e2e] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-light)]" />
              <span className="text-xs text-gray-400">to</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-light)]" />
            </div>
          )}

          <button onClick={handleExport} disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {exporting ? "Exported!" : "Export CSV"}
          </button>

          <button onClick={fetchAnalytics} className="p-2 text-gray-400 hover:text-[#0d4d4d] border border-gray-200 rounded-lg transition-colors" title="Refresh">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stat Cards — render immediately */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Inquiries" value={data.totalConversations} icon="💬" trend={data.conversationsTrend} />
        <StatCard label="Messages" value={data.totalMessages} icon="✉️" trend={data.messagesTrend} />
        <StatCard label="Customers" value={data.totalCustomers} icon="👥" trend={data.customersTrend} />
        <StatCard label="Unread" value={data.unreadMessages} icon={data.unreadMessages > 0 ? "🔔" : "✅"} trend={data.unreadTrend} trendInvert />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Response Rate" value={`${data.responseRate}%`} icon="⚡" />
        <StatCard label="Avg Response" value={data.responseTimeFormatted} icon="⏱️" />
        <StatCard label="Avg Msgs/Conv" value={data.avgMessagesPerConv} icon="📊" />
        <StatCard label="Conversion" value={`${data.conversionRate}%`} icon="🎯" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Peak Activity", value: data.peakHour, desc: "Busiest hour", color: "text-blue-500" },
          { label: "This Month", value: data.conversationsThisMonth, desc: "New inquiries", color: "text-purple-500" },
          { label: "New Customers", value: data.newCustomersThisMonth, desc: "This month", color: "text-orange-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-lg font-bold ${s.color}`}>
              {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0a2e2e]">{s.label}</p>
              <p className="text-[10px] text-gray-400">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts — lazy loaded, show skeleton while loading */}
      <Suspense fallback={
        <div className="grid lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-56 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      }>
        <AnalyticsCharts data={data} period={period} />
      </Suspense>
    </div>
  );
}
