import { auth } from "@/auth";
import { getMagnetById } from "@/lib/db/queries/magnets";
import { getTabsByMagnet } from "@/lib/db/queries/tabs";
import { notFound, redirect } from "next/navigation";
import { hasAI } from "@/lib/ai";
import MagnetEditorLoader from "@/components/editor/MagnetEditorLoader";
import Link from "next/link";
import { ArrowLeft, BarChart2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const magnet = await getMagnetById(id, session?.user?.id);
  return { title: magnet?.title ?? "Editor" };
}

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const magnet = await getMagnetById(id, session.user.id);
  if (!magnet) notFound();
  const tabs = await getTabsByMagnet(id);

  return (
    <div className="flex flex-col h-screen">
      {/* Sub-nav */}
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm shrink-0">
        <Link href="/dashboard" className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Magnets
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 font-medium truncate max-w-xs">{magnet.title}</span>
        <div className="ml-auto flex gap-1">
          <Link href={`/magnets/${id}/analytics`}>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" />
              Analytics
            </Button>
          </Link>
          <Link href={`/magnets/${id}/settings`}>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
      <MagnetEditorLoader magnet={magnet} tabs={tabs} hasAI={hasAI} />
    </div>
  );
}
