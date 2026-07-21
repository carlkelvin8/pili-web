"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
  LineChart, Line,
} from "recharts";

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
}

const STATUS_COLORS: Record<string, string> = { OPEN: "#22c55e", PENDING: "#eab308", CLOSED: "#9ca3af" };

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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<"12m" | "6m" | "3m">("12m");
  const router = useRouter();

  const fetchAnalytics = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const res = await fetch("/api/analytics", { credentials: "same-origin" });
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
  }, [router]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

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

  const pieData = Object.entries(data.statusBreakdown).map(([status, count]) => ({ name: status, value: count }));
  const totalStatusCount = pieData.reduce((sum, d) => sum + d.value, 0);

  const slicedMonthly = data.monthlyInquiries.slice(
    period === "3m" ? -3 : period === "6m" ? -6 : 0
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2e2e] font-[family-name:var(--font-poppins)]">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive overview of your site activity</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {([["3m", "3M"], ["6m", "6M"], ["12m", "12M"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setPeriod(key)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${period === key ? "bg-white text-[#0a2e2e] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={fetchAnalytics} className="p-2 text-gray-400 hover:text-[#0d4d4d] border border-gray-200 rounded-lg transition-colors" title="Refresh">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Inquiries" value={data.totalConversations} icon="💬" trend={data.conversationsTrend} />
        <StatCard label="Messages" value={data.totalMessages} icon="✉️" trend={data.messagesTrend} />
        <StatCard label="Customers" value={data.totalCustomers} icon="👥" trend={data.customersTrend} />
        <StatCard label="Unread" value={data.unreadMessages} icon={data.unreadMessages > 0 ? "🔔" : "✅"} trend={data.unreadTrend} trendInvert />
        <StatCard label="Response Rate" value={`${data.responseRate}%`} icon="⚡" />
        <StatCard label="Avg Msgs/Conv" value={data.avgMessagesPerConv} icon="📊" />
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Conversion Rate", value: `${data.conversionRate}%`, desc: "Inquiries closed", color: "text-[#3ecbac]" },
          { label: "Peak Activity", value: data.peakHour, desc: "Busiest hour (30d)", color: "text-blue-500" },
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

      {/* Row 1: Area chart + Donut */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#0a2e2e]">Inquiries & Messages Trend</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">Monthly overview for the past {period === "3m" ? "3" : period === "6m" ? "6" : "12"} months</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={slicedMonthly} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradInquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d4d4d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d4d4d" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3ecbac" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3ecbac" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                <Area type="monotone" dataKey="messages" stroke="#3ecbac" strokeWidth={2} fill="url(#gradMessages)" name="Messages" />
                <Area type="monotone" dataKey="inquiries" stroke="#0d4d4d" strokeWidth={2} fill="url(#gradInquiries)" name="Inquiries" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
          <h2 className="text-sm font-semibold text-[#0a2e2e] mb-2">Status Breakdown</h2>
          <p className="text-[10px] text-gray-400 mb-4">{totalStatusCount} total inquiries</p>
          <div className="flex-1 min-h-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-gray-100">
            {pieData.map((d) => (
              <div key={d.name} className="text-center">
                <p className="text-lg font-bold text-[#0a2e2e]">{d.value}</p>
                <p className="text-[10px] text-gray-400">{d.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Daily messages line + Day of week bar */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-[#0a2e2e] mb-1">Daily Message Volume</h2>
          <p className="text-[10px] text-gray-400 mb-4">Last 30 days</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyMessages} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                <Line type="monotone" dataKey="count" stroke="#0d4d4d" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#0d4d4d" }} name="Messages" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-[#0a2e2e] mb-1">Busiest Days</h2>
          <p className="text-[10px] text-gray-400 mb-4">Messages by day of week (30d)</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dayOfWeekData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                <Bar dataKey="messages" fill="#3ecbac" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Hourly heatmap + Top customers */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-[#0a2e2e] mb-1">Hourly Activity Pattern</h2>
          <p className="text-[10px] text-gray-400 mb-4">Messages by hour of day (30d) — Peak: {data.peakHour}</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourlyData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 8 }} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                <Bar dataKey="messages" radius={[3, 3, 0, 0]}>
                  {data.hourlyData.map((entry, index) => {
                    const max = Math.max(...data.hourlyData.map((h) => h.messages));
                    const opacity = max > 0 ? 0.2 + (entry.messages / max) * 0.8 : 0.2;
                    return <Cell key={index} fill={`rgba(13, 77, 77, ${opacity})`} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-[#0a2e2e] mb-1">Top Customers</h2>
          <p className="text-[10px] text-gray-400 mb-4">Most active by message count</p>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {data.topCustomers.length > 0 ? data.topCustomers.map((c, i) => {
              const maxCount = data.topCustomers[0]?.count || 1;
              return (
                <div key={c.email} className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 w-4 text-right font-mono">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#0a2e2e] truncate">{c.name}</span>
                      <span className="text-[10px] font-semibold text-gray-500 ml-2">{c.count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#3ecbac] rounded-full transition-all" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                    </div>
                    <p className="text-[9px] text-gray-400 truncate mt-0.5">{c.email}</p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-gray-400 text-center py-4">No customer data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-[#0a2e2e] mb-1">Recent Activity</h2>
        <p className="text-[10px] text-gray-400 mb-4">Latest 20 messages across all conversations</p>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {data.recentActivity.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                msg.role === "ADMIN" ? "bg-[#0d4d4d] text-white" : "bg-[#3ecbac]/20 text-[#0d4d4d]"
              }`}>
                {msg.sender.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#0a2e2e]">{msg.sender}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                    msg.role === "ADMIN" ? "bg-[#0d4d4d]/10 text-[#0d4d4d]" : "bg-gray-100 text-gray-500"
                  }`}>{msg.role}</span>
                  <span className="text-[10px] text-gray-400 ml-auto shrink-0">
                    {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                    {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 truncate">{msg.content}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">in <span className="font-medium">{msg.conversationSubject}</span></p>
              </div>
            </div>
          ))}
          {data.recentActivity.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No messages yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
