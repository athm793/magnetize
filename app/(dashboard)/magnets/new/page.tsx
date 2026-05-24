"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BookOpen, CheckSquare, BarChart2, FileText, Layers, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

const TEMPLATES = [
  {
    id: "ultimate-guide",
    label: "Ultimate Guide",
    description: "Deep-dive resource on a topic",
    tabs: "3 tabs · Intro, Framework, Summary",
    icon: BookOpen,
    color: "bg-violet-100 text-violet-600",
  },
  {
    id: "checklist",
    label: "Checklist",
    description: "Step-by-step action list",
    tabs: "2 tabs · Checklist, Pro Tips",
    icon: CheckSquare,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "case-study",
    label: "Case Study",
    description: "Real results and methodology",
    tabs: "3 tabs · Overview, Strategy, Results",
    icon: BarChart2,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "whitepaper",
    label: "Whitepaper",
    description: "Data-driven research document",
    tabs: "3 tabs · Summary, Findings, Recommendations",
    icon: FileText,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "swipe-file",
    label: "Swipe File",
    description: "Collection of examples and templates",
    tabs: "2 tabs · Templates, Real Examples",
    icon: Layers,
    color: "bg-pink-100 text-pink-600",
  },
  {
    id: "blank",
    label: "Blank",
    description: "Start from scratch",
    tabs: "1 tab · Empty canvas",
    icon: Plus,
    color: "bg-gray-100 text-gray-500",
  },
];

export default function NewMagnetPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function create(templateId: string, titleOverride?: string) {
    const finalTitle = titleOverride ?? title;
    if (!finalTitle.trim()) { toast.error("Give it a name first"); return; }
    setLoading(templateId);
    const res = await fetch("/api/magnets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: finalTitle, templateId }),
    });
    if (!res.ok) { toast.error("Failed to create magnet"); setLoading(null); return; }
    const magnet = await res.json();
    router.push(`/magnets/${magnet.id}/editor`);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">New Lead Magnet</h1>
      <p className="text-gray-500 text-sm mb-8">Name it, pick a template, and start editing.</p>

      <div className="mb-8">
        <Label htmlFor="title" className="text-base font-medium">Name</Label>
        <div className="flex gap-2 mt-2">
          <Input
            id="title"
            placeholder="e.g. B2B Cold Email Playbook 2025"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && create("blank")}
            className="text-base"
            autoFocus
          />
          <Button onClick={() => create("blank")} disabled={!!loading} className="bg-violet-600 hover:bg-violet-700 shrink-0">
            {loading === "blank" ? "Creating…" : "Create blank"}
          </Button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-600 mb-3">Or start from a template</p>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.filter(t => t.id !== "blank").map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => create(t.id, title || t.label)}
                disabled={!!loading}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-left transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${t.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 group-hover:text-violet-700 transition-colors">
                    {loading === t.id ? "Creating…" : t.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>
                  <p className="text-xs text-violet-500 mt-1 font-medium">{t.tabs}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
