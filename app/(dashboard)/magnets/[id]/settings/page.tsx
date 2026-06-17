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
import { ArrowLeft, Plus, Trash2, GripVertical, BarChart2, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import type { Gate, FormField, FieldType } from "@/lib/db/queries/gates";

// Pre-built field templates
const FIELD_TEMPLATES: FormField[] = [
  { name: "name",         type: "text",     required: false, label: "Full name",         placeholder: "Alex Smith" },
  { name: "company",      type: "text",     required: false, label: "Company",            placeholder: "Acme Inc." },
  { name: "phone",        type: "tel",      required: false, label: "Phone",              placeholder: "555 000 0000", validation: { defaultCountryCode: "+1" } },
  { name: "role",         type: "text",     required: false, label: "Job title",          placeholder: "Head of Sales" },
  { name: "company_url",  type: "url",      required: false, label: "Company website",    placeholder: "https://company.com" },
  { name: "linkedin",     type: "linkedin", required: false, label: "LinkedIn URL",       placeholder: "linkedin.com/in/yourname" },
];

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text:     "Text",
  email:    "Email",
  tel:      "Phone",
  url:      "URL",
  linkedin: "LinkedIn",
  select:   "Dropdown",
};

export default function MagnetSettingsPage() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [magnet, setMagnet] = useState<{ title: string; status: string; settings: Record<string, string> } | null>(null);
  const [gates, setGates] = useState<Gate[]>([]);
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [zapierUrl, setZapierUrl] = useState("");
  const [rb2bPixel, setRb2bPixel] = useState("");
  const [saving, setSaving] = useState(false);

  // Custom field builder state (per gate id)
  const [customLabel, setCustomLabel] = useState<Record<string, string>>({});
  const [customType, setCustomType] = useState<Record<string, FieldType>>({});

  useEffect(() => {
    fetch(`/api/magnets/${params.id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        setMagnet(data.magnet);
        setGates(data.gates ?? []);
        setPrimaryColor(data.magnet.settings?.primaryColor ?? "#7c3aed");
        setBgColor(data.magnet.settings?.bgColor ?? "#ffffff");
        setLoading(false);
      })
      .catch(() => { toast.error("Failed to load settings"); setLoading(false); });

    fetch(`/api/integrations?magnetId=${params.id}`)
      .then(r => { if (!r.ok) return []; return r.json(); })
      .then(integrations => {
        if (!Array.isArray(integrations)) return;
        const zapier = integrations.find((i: { type: string }) => i.type === "zapier");
        const rb2b   = integrations.find((i: { type: string }) => i.type === "rb2b");
        if (zapier) setZapierUrl((zapier.config as { webhookUrl: string }).webhookUrl ?? "");
        if (rb2b)   setRb2bPixel((rb2b.config as { pixelId: string }).pixelId ?? "");
      })
      .catch(() => {});
  }, [params.id]);

  // ── Gate helpers ──────────────────────────────────────────────────────────

  async function syncGate(gate: Gate, fields: FormField[]) {
    await fetch(`/api/magnets/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateGate", gateId: gate.id, formFields: fields }),
    });
    setGates(prev => prev.map(g => g.id === gate.id ? { ...g, form_fields: fields } : g));
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

  function addTemplateField(gate: Gate, tpl: FormField) {
    syncGate(gate, [...gate.form_fields, tpl]);
  }

  function removeField(gate: Gate, fieldName: string) {
    syncGate(gate, gate.form_fields.filter(f => f.name !== fieldName));
  }

  function toggleRequired(gate: Gate, fieldName: string) {
    syncGate(
      gate,
      gate.form_fields.map(f => f.name === fieldName ? { ...f, required: !f.required } : f)
    );
  }

  function moveField(gate: Gate, index: number, dir: -1 | 1) {
    const fields = [...gate.form_fields];
    const swap = index + dir;
    if (swap < 0 || swap >= fields.length) return;
    [fields[index], fields[swap]] = [fields[swap], fields[index]];
    syncGate(gate, fields);
  }

  function addCustomField(gate: Gate) {
    const label = customLabel[gate.id]?.trim();
    if (!label) { toast.error("Enter a field label"); return; }
    const type = customType[gate.id] ?? "text";
    const name = `custom_${label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")}_${Date.now()}`;
    const field: FormField = { name, type, required: false, label, placeholder: "" };
    syncGate(gate, [...gate.form_fields, field]);
    setCustomLabel(prev => ({ ...prev, [gate.id]: "" }));
  }

  // ── Branding / integrations ───────────────────────────────────────────────

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

      {/* ── Lead Gates ──────────────────────────────────────────────────── */}
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

        <div className="space-y-4">
          {gates.map((gate, gi) => {
            const availableTemplates = FIELD_TEMPLATES.filter(
              ft => !gate.form_fields.some(f => f.name === ft.name)
            );
            return (
              <div key={gate.id} className="bg-white rounded-xl border border-gray-200 p-4">
                {/* Gate header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {gate.type === "content_gate" ? "Content Gate" : gate.type === "popup" ? "Popup" : "Top Bar"}
                    </Badge>
                    <Switch checked={gate.active} onCheckedChange={() => toggleGate(gate)} />
                    <span className="text-xs text-gray-500">{gate.active ? "Active" : "Inactive"}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeGate(gate.id)}
                    className="h-7 w-7 p-0 text-red-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Field list */}
                <p className="text-xs font-semibold text-gray-600 mb-2">Form fields</p>
                <div className="space-y-1.5 mb-3">
                  {gate.form_fields.map((field, fi) => (
                    <div key={field.name} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
                      {/* Reorder arrows */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          onClick={() => moveField(gate, fi, -1)}
                          disabled={fi === 0}
                          className="text-gray-300 hover:text-gray-500 disabled:opacity-0"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveField(gate, fi, 1)}
                          disabled={fi === gate.form_fields.length - 1}
                          className="text-gray-300 hover:text-gray-500 disabled:opacity-0"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="flex-1 font-medium text-gray-700 truncate">{field.label}</span>
                      <span className="text-gray-400 shrink-0">{FIELD_TYPE_LABELS[field.type] ?? field.type}</span>

                      {/* Required toggle */}
                      <button
                        onClick={() => toggleRequired(gate, field.name)}
                        className={`text-xs px-1.5 py-0.5 rounded border transition-colors shrink-0 ${
                          field.required
                            ? "bg-violet-50 border-violet-200 text-violet-700"
                            : "bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {field.required ? "required" : "optional"}
                      </button>

                      {/* Delete (protect email) */}
                      {field.name !== "email" && (
                        <button onClick={() => removeField(gate, field.name)} className="text-gray-300 hover:text-red-400 shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add from templates */}
                {availableTemplates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {availableTemplates.map(ft => (
                      <button
                        key={ft.name}
                        onClick={() => addTemplateField(gate, ft)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        {ft.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom field builder */}
                <div className="border-t border-gray-100 pt-3 mt-2">
                  <p className="text-xs text-gray-400 mb-2">Add custom field</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Field label…"
                      value={customLabel[gate.id] ?? ""}
                      onChange={e => setCustomLabel(prev => ({ ...prev, [gate.id]: e.target.value }))}
                      className="h-7 text-xs flex-1"
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomField(gate); } }}
                    />
                    <Select
                      value={customType[gate.id] ?? "text"}
                      onValueChange={v => setCustomType(prev => ({ ...prev, [gate.id]: v as FieldType }))}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(FIELD_TYPE_LABELS) as [FieldType, string][])
                          .filter(([t]) => t !== "select")
                          .map(([t, label]) => (
                            <SelectItem key={t} value={t} className="text-xs">{label}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="h-7 text-xs px-3 shrink-0" onClick={() => addCustomField(gate)}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Separator className="my-6" />

      {/* ── Branding ─────────────────────────────────────────────────────── */}
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

      {/* ── Integrations ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Integrations</h2>
        <p className="text-xs text-gray-500 mb-4">Send leads to your other tools automatically</p>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900 mb-0.5">Zapier Webhook</p>
            <p className="text-xs text-gray-400 mb-3">POST lead data to any Zapier catch hook</p>
            <div className="flex gap-2">
              <Input placeholder="https://hooks.zapier.com/hooks/catch/…" value={zapierUrl} onChange={e => setZapierUrl(e.target.value)} className="text-xs h-8" />
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
