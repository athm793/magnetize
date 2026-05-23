"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Lead } from "@/lib/db/queries/leads";
import Papa from "papaparse";

export default function LeadTable({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState("");

  const filtered = leads.filter(
    (l) =>
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function exportCSV() {
    const rows = filtered.map((l) => ({
      email: l.email,
      name: l.name ?? "",
      date: new Date(l.created_at).toISOString(),
      ...l.data,
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0} className="h-8">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export CSV
        </Button>
        <Badge variant="secondary" className="text-xs">{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</Badge>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">
          {leads.length === 0 ? "No leads yet. Share your published magnet to start collecting." : "No results match your search."}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 hidden sm:table-cell">Extra data</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Captured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{lead.email}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {Object.entries(lead.data ?? {}).length > 0
                      ? Object.entries(lead.data).map(([k, v]) => `${k}: ${v}`).join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
