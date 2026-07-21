"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  totalCustomers: number;
  unreadMessages: number;
  statusBreakdown: Record<string, number>;
  monthlyInquiries: { month: string; inquiries: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#22c55e",
  PENDING: "#eab308",
  CLOSED: "#9ca3af",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const analytics = await res.json();
          setData(analytics);
        }
      } catch {}
      setLoading(false);
    };
    fetchAnalytics();
  }, [router]);

  if (loading || !data) {
    return (
      <div className="p-6">
        <div className="text-gray-400 text-sm">Loading analytics...</div>
      </div>
    );
  }

  const pieData = Object.entries(data.statusBreakdown).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0a2e2e] font-[family-name:var(--font-poppins)]">
          Analytics Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your site activity</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Inquiries", value: data.totalConversations, color: "bg-blue-50 text-blue-700", icon: "💬" },
          { label: "Total Messages", value: data.totalMessages, color: "bg-green-50 text-green-700", icon: "✉️" },
          { label: "Customers", value: data.totalCustomers, color: "bg-purple-50 text-purple-700", icon: "👥" },
          { label: "Unread", value: data.unreadMessages, color: "bg-red-50 text-red-700", icon: "🔴" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold text-[#0a2e2e]">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar chart - monthly inquiries */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-[#0a2e2e] mb-4">Inquiries per Month</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyInquiries} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                />
                <Bar dataKey="inquiries" fill="#0d4d4d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart - status breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-[#0a2e2e] mb-4">Status Breakdown</h2>
          <div className="h-72">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                    style={{ fontSize: "11px" }}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
