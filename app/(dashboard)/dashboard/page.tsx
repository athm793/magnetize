import { auth } from "@/auth";
import { getMagnetsByUser } from "@/lib/db/queries/magnets";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BarChart2, Settings, ExternalLink, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import MagnetActions from "@/components/dashboard/MagnetActions";

export default async function DashboardPage() {
  const session = await auth();
  const magnets = await getMagnetsByUser(session!.user!.id!);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Lead Magnets</h1>
          <p className="text-sm text-gray-500 mt-1">{magnets.length} magnet{magnets.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/magnets/new">
          <Button className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" />
            New magnet
          </Button>
        </Link>
      </div>

      {magnets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-violet-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Create your first lead magnet</h3>
          <p className="text-sm text-gray-500 mb-4">Build an interactive page that collects leads automatically.</p>
          <Link href="/magnets/new">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" />
              Create magnet
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {magnets.map((magnet) => (
            <div key={magnet.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:border-gray-300 transition-colors">
              <div
                className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                style={{ backgroundColor: (magnet.settings as { primaryColor?: string }).primaryColor ?? "#7c3aed" }}
              >
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-gray-900 truncate">{magnet.title}</h3>
                  <Badge variant={magnet.status === "published" ? "default" : "secondary"} className="text-xs shrink-0">
                    {magnet.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400">
                  Updated {formatDistanceToNow(new Date(magnet.updated_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {magnet.status === "published" && (
                  <a href={`/p/${magnet.slug}`} target="_blank" rel="noopener" aria-label={`View "${magnet.title}" live page`}>
                    <Button variant="ghost" size="sm" className="h-11 w-11 p-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                )}
                <Link href={`/magnets/${magnet.id}/analytics`} aria-label={`View analytics for "${magnet.title}"`}>
                  <Button variant="ghost" size="sm" className="h-11 w-11 p-0">
                    <BarChart2 className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link href={`/magnets/${magnet.id}/settings`} aria-label={`Open settings for "${magnet.title}"`}>
                  <Button variant="ghost" size="sm" className="h-11 w-11 p-0">
                    <Settings className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link href={`/magnets/${magnet.id}/editor`}>
                  <Button size="sm" variant="outline" className="h-11 text-xs">Edit</Button>
                </Link>
                <MagnetActions magnetId={magnet.id} magnetTitle={magnet.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
