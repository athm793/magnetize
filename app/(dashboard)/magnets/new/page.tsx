"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

const TEMPLATES = [
  { label: "Ultimate Guide", description: "Deep-dive resource on a topic" },
  { label: "Checklist", description: "Step-by-step action list" },
  { label: "Case Study", description: "Real results and methodology" },
  { label: "Whitepaper", description: "Data-driven research document" },
  { label: "Swipe File", description: "Collection of examples and templates" },
  { label: "Blank", description: "Start from scratch" },
];

export default function NewMagnetPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function create(titleOverride?: string) {
    const finalTitle = titleOverride ?? title;
    if (!finalTitle.trim()) { toast.error("Give it a name first"); return; }
    setLoading(true);
    const res = await fetch("/api/magnets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: finalTitle }),
    });
    if (!res.ok) { toast.error("Failed to create magnet"); setLoading(false); return; }
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
      <p className="text-gray-500 text-sm mb-8">Name it anything — you can change this later.</p>

      <div className="mb-6">
        <Label htmlFor="title" className="text-base font-medium">Name</Label>
        <div className="flex gap-2 mt-2">
          <Input
            id="title"
            placeholder="e.g. B2B Cold Email Playbook 2025"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && create()}
            className="text-base"
            autoFocus
          />
          <Button onClick={() => create()} disabled={loading} className="bg-violet-600 hover:bg-violet-700 shrink-0">
            {loading ? "Creating…" : "Create"}
          </Button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-600 mb-3">Or start from a template</p>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              onClick={() => create(t.label === "Blank" ? (title || "Untitled") : t.label)}
              disabled={loading}
              className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
