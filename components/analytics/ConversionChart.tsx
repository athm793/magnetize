"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { DailyStat } from "@/lib/db/queries/analytics";

export default function ConversionChart({ data }: { data: DailyStat[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-400 bg-gray-50 rounded-xl border border-gray-200">
        No analytics data yet. Share your published magnet to start tracking.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickFormatter={(d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })}
        />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          labelFormatter={(d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="views" stroke="#a78bfa" strokeWidth={2} dot={false} name="Views" />
        <Line type="monotone" dataKey="leads" stroke="#7c3aed" strokeWidth={2} dot={false} name="Leads" />
      </LineChart>
    </ResponsiveContainer>
  );
}
