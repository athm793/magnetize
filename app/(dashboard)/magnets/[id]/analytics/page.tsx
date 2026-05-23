import { auth } from "@/auth";
import { getMagnetById } from "@/lib/db/queries/magnets";
import { getMagnetStats, getDailyStats } from "@/lib/db/queries/analytics";
import { getLeadsByMagnet } from "@/lib/db/queries/leads";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Settings, Eye, Users, MousePointerClick, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConversionChart from "@/components/analytics/ConversionChart";
import LeadTable from "@/components/analytics/LeadTable";

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const magnet = await getMagnetById(id, session.user.id);
  if (!magnet) notFound();

  const [stats, dailyStats, leads] = await Promise.all([
    getMagnetStats(id),
    getDailyStats(id, 30),
    getLeadsByMagnet(id, { limit: 500 }),
  ]);

  const statCards = [
    { label: "Total views", value: stats.total_views, icon: <Eye className="w-4 h-4" />, color: "text-blue-600 bg-blue-50" },
    { label: "Gate shown", value: stats.total_gate_shown, icon: <MousePointerClick className="w-4 h-4" />, color: "text-amber-600 bg-amber-50" },
    { label: "Leads collected", value: stats.total_leads, icon: <Users className="w-4 h-4" />, color: "text-violet-600 bg-violet-50" },
    { label: "Conversion rate", value: `${stats.conversion_rate}%`, icon: <TrendingUp className="w-4 h-4" />, color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-sm transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Magnets
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600 font-medium truncate max-w-xs">{magnet.title}</span>
        <div className="ml-auto flex gap-1">
          <Link href={`/magnets/${id}/editor`}>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5"><Pencil className="w-3.5 h-3.5" />Edit</Button>
          </Link>
          <Link href={`/magnets/${id}/settings`}>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5"><Settings className="w-3.5 h-3.5" />Settings</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Last 30 days</h2>
        <ConversionChart data={dailyStats} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">All Leads</h2>
        <LeadTable leads={leads} />
      </div>
    </div>
  );
}
