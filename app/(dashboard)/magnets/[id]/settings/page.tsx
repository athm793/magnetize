"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, GripVertical, BarChart2, Pencil } from "lucide-react";
import type { Gate, FormField } from "@/lib/db/queries/gates";

const FIELD_TEMPLATES: FormField[] = [
  { name: "name", type: "text", required: false, label: "Full name", placeholder: "Alex Smith" },
  { name: "company", type: "text", required: false, label: "Company", placeholder: "Acme Inc." },
  { name: "phone", type: "tel", required: false, label: "Phone", placeholder: "+1 555 000 0000" },
  { name: "role", type: "text", required: false, label: "Job title", placeholder: "Head of Sales" },
];

export default function MagnetSettingsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [magnet, setMagnet] = useState<{ title: string; status: string; settings: Record<string, string> } | null>(null);
  const [gates, setGates] = useState<Gate[]>([]);
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [zapierUrl, setZapierUrl] = useState("");
  const [rb2bPixel, setRb2bPixel] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/magnets/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setMagnet(data.magnet);
        setGates(data.gates ?? []);
        setPrimaryColor(data.magnet.settings?.primaryColor ?? "#7c3aed");
        setBgColor(data.magnet.settings?.bgColor ?? "#ffffff");
        setLoading(false);
      });
    fetch(`/api/integrations?magnetId=${params.id}`)
      .then(r => r.json())
      .then(integrations => {
        const zapier = integrations.find((i: { type: string }) => i.type === "zapier");
        const rb2b = integrations.find((i: { type: string }) => i.type === "rb2b");
        if (zapier) setZapierUrl((zapier.config as { webhookUrl: string }).webhookUrl ?? "");
        if (rb2b) setRb2bPixel((rb2b.config as { pixelId: string }).pixelId ?? "");
      });
  }, [params.id]);

  async function saveBranding() {
    setSaving(true);
    await fetch(`/api/magnets/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: { ...magnet?.settings, primaryColor, bgColor } }),
    });
    setSaving(false);
    toast.success("Branding saved");
  }

  async function saveZapier() {
    if (!zapierUrl.trim()) return;
    await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ magnetId: params.id, type: "zapier", config: { webhookUrl: zapierUrl } }),
    });
    toast.success("Zapier webhook saved");
  }

  async function saveRb2b() {
    if (!rb2bPixel.trim()) return;
    await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ magnetId: params.id, type: "rb2b", config: { pixelId: rb2bPixel } }),
    });
    toast.success("RB2B pixel saved");
  }

  async function addGate(type: Gate["type"]) {
    const res = await fetch(`/api/magnets/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "createGate", type }),
    });
    const gate = await res.json();
    setGates(prev => [...prev, gate]);
    toast.success("Gate added");
  }

  async function toggleGate(gate: Gate) {
    await fetch(`/api/magnets/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateGate", gateId: gate.id, active: !gate.active }),
    });
    setGates(prev => prev.map(g => g.id === gate.id ? { ...g, active: !g.active } : g));
  }

  async function removeGate(gateId: string) {
    await fetch(`/api/magnets/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteGate", gateId }),
    });
    setGates(prev => prev.filter(g => g.id !== gateId));
  }

  async function addField(gate: Gate, field: FormField) {
    const updated = [...gate.form_fields, field];
    await fetch(`/api/magnets/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateGate", gateId: gate.id, formFields: updated }),
    });
    setGates(prev => prev.map(g => g.id === gate.id ? { ...g, form_fields: updated } : g));
  }

  async function removeField(gate: Gate, fieldName: string) {
    const updated = gate.form_fields.filter(f => f.name !== fieldName);
    await fetch(`/api/magnets/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateGate", gateId: gate.id, formFields: updated }),
    });
    setGates(prev => prev.map(g => g.id === gate.id ? { ...g, form_fields: updated } : g));
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading…</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-sm transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Magnets
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600 font-medium">{magnet?.title}</span>
        <div className="ml-auto flex gap-1">
          <Link href={`/magnets/${params.id}/editor`}>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5"><Pencil className="w-3.5 h-3.5" />Edit</Button>
          </Link>
          <Link href={`/magnets/${params.id}/analytics`}>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5"><BarChart2 className="w-3.5 h-3.5" />Analytics</Button>
          </Link>
        </div>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Lead Gates */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Lead Gates</h2>
            <p className="text-xs text-gray-500 mt-0.5">Choose how visitors submit their info</p>
          </div>
          <Select onValueChange={(v) => addGate(v as Gate["type"])}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Add gate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="content_gate">Content Gate</SelectItem>
              <SelectItem value="popup">Popup</SelectItem>
              <SelectItem value="topbar">Top Bar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {gates.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            No gates yet. Add one above.
          </div>
        )}

        <div className="space-y-3">
          {gates.map(gate => (
            <div key={gate.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {gate.type === "content_gate" ? "Content Gate" : gate.type === "popup" ? "Popup" : "Top Bar"}
                  </Badge>
                  <Switch checked={gate.active} onCheckedChange={() => toggleGate(gate)} />
                  <span className="text-xs text-gray-500">{gate.active ? "Active" : "Inactive"}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeGate(gate.id)} className="h-7 w-7 p-0 text-red-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <p className="text-xs font-medium text-gray-600 mb-2">Form fields</p>
              <div className="space-y-1.5 mb-3">
                {gate.form_fields.map(field => (
                  <div key={field.name} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
                    <GripVertical className="w-3 h-3 text-gray-300" />
                    <span className="flex-1 font-medium text-gray-700">{field.label}</span>
                    <span className="text-gray-400">{field.type}</span>
                    {field.required && <Badge variant="outline" className="text-xs py-0">required</Badge>}
                    {field.name !== "email" && (
                      <button onClick={() => removeField(gate, field.name)} className="text-gray-300 hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {FIELD_TEMPLATES.filter(ft => !gate.form_fields.some(f => f.name === ft.name)).map(ft => (
                  <button
                    key={ft.name}
                    onClick={() => addField(gate, ft)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {ft.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-6" />

      {/* Branding */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Branding</h2>
        <p className="text-xs text-gray-500 mb-4">Customize colors for your public page</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-xs">Primary color</Label>
            <div className="flex gap-2 mt-1.5 items-center">
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
              <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-8 text-xs font-mono" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Background color</Label>
            <div className="flex gap-2 mt-1.5 items-center">
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
              <Input value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-8 text-xs font-mono" />
            </div>
          </div>
        </div>
        <Button size="sm" onClick={saveBranding} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
          {saving ? "Saving…" : "Save branding"}
        </Button>
      </section>

      <Separator className="my-6" />

      {/* Integrations */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Integrations</h2>
        <p className="text-xs text-gray-500 mb-4">Send leads to your other tools automatically</p>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900 mb-0.5">Zapier Webhook</p>
            <p className="text-xs text-gray-400 mb-3">POST lead data to any Zapier catch hook</p>
            <div className="flex gap-2">
              <Input placeholder="https://hooks.zapier.com/hooks/catch/..." value={zapierUrl} onChange={e => setZapierUrl(e.target.value)} className="text-xs h-8" />
              <Button size="sm" onClick={saveZapier} variant="outline" className="h-8 shrink-0">Save</Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900 mb-0.5">RB2B Pixel</p>
            <p className="text-xs text-gray-400 mb-3">Identify anonymous visitors with RB2B</p>
            <div className="flex gap-2">
              <Input placeholder="RB2B pixel ID" value={rb2bPixel} onChange={e => setRb2bPixel(e.target.value)} className="text-xs h-8" />
              <Button size="sm" onClick={saveRb2b} variant="outline" className="h-8 shrink-0">Save</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
