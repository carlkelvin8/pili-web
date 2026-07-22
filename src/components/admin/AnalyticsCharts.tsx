"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
  LineChart, Line,
} from "recharts";

const STATUS_COLORS: Record<string, string> = { OPEN: "#22c55e", PENDING: "#eab308", CLOSED: "#9ca3af" };

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  period: "12m" | "6m" | "3m";
}

export default function AnalyticsCharts({ data, period }: Props) {
  const pieData = Object.entries(data.statusBreakdown).map(([status, count]) => ({ name: status, value: count as number }));
  const totalStatusCount = pieData.reduce((sum, d) => sum + d.value, 0);

  const slicedMonthly = data.monthlyInquiries.slice(
    period === "3m" ? -3 : period === "6m" ? -6 : 0
  );

  return (
    <div className="space-y-6">
      {/* Row 1: Area chart + Donut */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#0a2e2e]">Inquiries & Messages Trend</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">Monthly overview</p>
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
                  {data.hourlyData.map((entry: { hour: string; messages: number }, index: number) => {
                    const max = Math.max(...data.hourlyData.map((h: { messages: number }) => h.messages));
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
            {data.topCustomers.length > 0 ? data.topCustomers.map((c: { name: string; email: string; count: number }, i: number) => {
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#0a2e2e]">Recent Activity</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">Latest 20 messages across all conversations</p>
          </div>
          <a href="/admin/activity" className="text-xs font-medium text-[#0d4d4d] hover:text-[#0a2e2e] underline">View All</a>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {data.recentActivity.map((msg: { id: string; content: string; createdAt: string; sender: string; role: string; conversationSubject: string }) => (
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
